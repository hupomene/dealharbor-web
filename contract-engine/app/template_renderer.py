from __future__ import annotations

from pathlib import Path
from docxtpl import DocxTemplate

from .schemas import DocumentPreviewPayload
from .template_mappers import build_template_specific_context


def render_docxtpl_template(
    template_path: Path,
    payload: DocumentPreviewPayload,
) -> bytes:
    doc = DocxTemplate(str(template_path))

    # 핵심: payload.data 전체를 그대로 넣지 말고
    # template_key에 맞는 매핑 결과만 context로 사용한다.
    context = build_template_specific_context(
        payload.templateKey,
        payload.data,
    )

    doc.render(context)

    from io import BytesIO

    buffer = BytesIO()
    doc.save(buffer)
    return buffer.getvalue()