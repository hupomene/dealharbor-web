from __future__ import annotations

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

    # 🔥 핵심 수정: payload.data를 그대로 쓰지 말고 mapper 결과만 사용
    context = build_template_specific_context(
        payload.templateKey,
        payload.data,
    )

    doc.render(context)

    from io import BytesIO

    buffer = BytesIO()
    doc.save(buffer)
    return buffer.getvalue()