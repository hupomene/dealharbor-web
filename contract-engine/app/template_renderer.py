from __future__ import annotations

from copy import deepcopy
from pathlib import Path
from typing import Any, Dict

from docxtpl import DocxTemplate

from .schemas import DocumentPreviewPayload
from .template_mappers import build_template_specific_context


def render_docxtpl_template(
    template_path: Path,
    payload: DocumentPreviewPayload,
) -> bytes:
    doc = DocxTemplate(str(template_path))
    context = build_template_context(payload)
    doc.render(context)

    from io import BytesIO

    buffer = BytesIO()
    doc.save(buffer)
    return buffer.getvalue()


def build_template_context(payload: DocumentPreviewPayload) -> Dict[str, Any]:
    base = deepcopy(payload.data)

    mapped = build_template_specific_context(payload.templateKey, base)

    return {
        "template_key": payload.templateKey,
        "document_name": payload.documentName,
        "output_filename": payload.outputFilename,
        "generated_at": payload.generatedAt,
        "deal_id": payload.dealId,
        "business_name": payload.businessName,
        "payload": mapped,
        **mapped,
    }