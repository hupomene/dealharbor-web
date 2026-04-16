from io import BytesIO
from pathlib import Path
from tempfile import TemporaryDirectory
from typing import Any, Dict, Tuple
from zipfile import ZIP_DEFLATED, ZipFile

from app.pdf_converter import convert_docx_bytes_to_pdf
from app.template_mappers import build_template_context
from app.template_registry import get_template_path
from app.template_renderer import render_docxtpl_template


def build_docx_bytes(template_key: str, deal: Dict[str, Any]) -> bytes:
    """
    Build a rendered DOCX from a real docxtpl template.
    No debug / payload-dump fallback is allowed in production.
    """
    template_path = get_template_path(template_key)
    context = build_template_context(template_key, deal)
    return render_docxtpl_template(template_path, context)


def build_document_bytes(
    template_key: str,
    deal: Dict[str, Any],
    output_format: str,
) -> Tuple[bytes, str, str]:
    """
    Returns:
      file_bytes, media_type, output_filename
    """
    output_format = (output_format or "docx").lower()

    docx_bytes = build_docx_bytes(template_key, deal)

    if output_format == "docx":
        return (
            docx_bytes,
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            f"{template_key}.docx",
        )

    if output_format == "pdf":
        pdf_bytes = convert_docx_bytes_to_pdf(docx_bytes)
        return (
            pdf_bytes,
            "application/pdf",
            f"{template_key}.pdf",
        )

    raise ValueError(f"Unsupported output format: {output_format}")


def build_zip_package(
    templates: list[str],
    deal: Dict[str, Any],
    output_format: str,
) -> Tuple[bytes, str, str]:
    """
    Creates a ZIP package of multiple rendered documents.
    """
    zip_buffer = BytesIO()

    with ZipFile(zip_buffer, "w", ZIP_DEFLATED) as zip_file:
        for template_key in templates:
            file_bytes, _media_type, filename = build_document_bytes(
                template_key=template_key,
                deal=deal,
                output_format=output_format,
            )
            zip_file.writestr(filename, file_bytes)

    zip_buffer.seek(0)
    return zip_buffer.read(), "application/zip", "contract_package.zip"