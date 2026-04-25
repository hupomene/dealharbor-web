from io import BytesIO
from zipfile import ZIP_DEFLATED, ZipFile
from typing import Any, Dict, Tuple, List

from app.template_registry import get_template_path
from app.template_renderer import render_docxtpl_template
from app.pdf_converter import convert_docx_bytes_to_pdf


def build_docx_bytes(template_key: str, payload: Any) -> bytes:
    template_path = get_template_path(template_key)
    return render_docxtpl_template(template_path, payload)


def build_document_bytes(
    payload: Any,
    output_format: str,
) -> Tuple[bytes, str, str]:
    template_key = payload.templateKey
    output_format = (output_format or "docx").lower()

    docx_bytes = build_docx_bytes(template_key, payload)

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
    payloads: List[Any],
    output_format: str,
) -> Tuple[bytes, str, str]:
    zip_buffer = BytesIO()

    with ZipFile(zip_buffer, "w", ZIP_DEFLATED) as zip_file:
        for payload in payloads:
            file_bytes, _media_type, filename = build_document_bytes(
                payload=payload,
                output_format=output_format,
            )
            zip_file.writestr(filename, file_bytes)

    zip_buffer.seek(0)
    return zip_buffer.read(), "application/zip", "contract_package.zip"