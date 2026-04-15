from __future__ import annotations

from typing import Any, Dict

from .asset_purchase_agreement import build_asset_purchase_agreement_context
from .bill_of_sale import build_bill_of_sale_context
from .promissory_note import build_promissory_note_context
from .non_compete import build_non_compete_context


def build_template_specific_context(
    template_key: str,
    base: Dict[str, Any],
) -> Dict[str, Any]:

    if template_key == "asset_purchase_agreement":
        return build_asset_purchase_agreement_context(base)

    if template_key == "bill_of_sale":
        return build_bill_of_sale_context(base)

    if template_key == "promissory_note":
        return build_promissory_note_context(base)

    if template_key == "non_compete":
        return build_non_compete_context(base)

    return base