from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
TEMPLATES_DIR = BASE_DIR / "templates"

TEMPLATE_REGISTRY = {
    "asset_purchase_agreement": TEMPLATES_DIR / "asset_purchase_agreement.docx",
    "bill_of_sale": TEMPLATES_DIR / "bill_of_sale.docx",
    "promissory_note": TEMPLATES_DIR / "promissory_note.docx",
    "non_compete": TEMPLATES_DIR / "non_compete.docx",
}


def get_template_path(template_key: str) -> Path:
    template_path = TEMPLATE_REGISTRY.get(template_key)
    if template_path is None:
        raise KeyError(f"Unknown template key: {template_key}")

    if not template_path.exists():
        raise FileNotFoundError(
            f"Template file not found for key '{template_key}': {template_path}"
        )

    return template_path