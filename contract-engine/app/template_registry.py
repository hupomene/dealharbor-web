from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
TEMPLATES_DIR = BASE_DIR / "templates"

TEMPLATE_FILE_MAP = {
    "asset_purchase_agreement": "asset_purchase_agreement.docx",
    "promissory_note": "promissory_note.docx",
    "bill_of_sale": "bill_of_sale.docx",
    "non_compete_agreement": "non_compete_agreement.docx",
    "equipment_list": "equipment_list.docx",
    "closing_checklist": "closing_checklist.docx",
}


def get_template_path(template_key: str) -> Path | None:
    filename = TEMPLATE_FILE_MAP.get(template_key)
    if not filename:
        return None
    return TEMPLATES_DIR / filename