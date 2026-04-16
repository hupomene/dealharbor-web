from typing import Any, Dict

from app.template_mappers.asset_purchase_agreement import (
    build_asset_purchase_agreement_context,
)
from app.template_mappers.bill_of_sale import build_bill_of_sale_context
from app.template_mappers.promissory_note import build_promissory_note_context
from app.template_mappers.non_compete import build_non_compete_context


def build_template_context(template_key: str, deal: Dict[str, Any]) -> Dict[str, Any]:
    if template_key == "asset_purchase_agreement":
        return build_asset_purchase_agreement_context(deal)

    if template_key == "bill_of_sale":
        return build_bill_of_sale_context(deal)

    if template_key == "promissory_note":
        return build_promissory_note_context(deal)

    if template_key == "non_compete":
        return build_non_compete_context(deal)

    raise ValueError(f"Unsupported template key: {template_key}")