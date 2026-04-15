from __future__ import annotations

from copy import deepcopy
from typing import Any, Dict

from .common import format_currency, format_date_for_template


def build_promissory_note_context(base: Dict[str, Any]) -> Dict[str, Any]:
    ctx = deepcopy(base)

    seller_name = str(ctx.get("seller_name") or "")
    buyer_name = str(ctx.get("buyer_name") or "")
    business_name = str(ctx.get("business_name") or "")
    state = str(ctx.get("state") or "")

    purchase_price = ctx.get("purchase_price")
    seller_financing_amount = ctx.get("seller_financing_amount")

    # 핵심 매핑
    ctx["principal_amount"] = format_currency(
        seller_financing_amount or purchase_price
    )

    ctx["issue_date"] = format_date_for_template(
        ctx.get("closing_date") or ctx.get("agreement_date")
    )

    ctx["borrower_name"] = buyer_name
    ctx["lender_name"] = seller_name
    ctx["business_name"] = business_name
    ctx["state"] = state

    return ctx