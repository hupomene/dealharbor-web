from __future__ import annotations

from copy import deepcopy
from typing import Any, Dict

from .common import (
    build_assets_bullets,
    build_purchase_terms_text,
    build_restrictive_covenants_text,
    format_currency,
    format_date_for_template,
    parse_equipment_items,
)


def build_bill_of_sale_context(base: Dict[str, Any]) -> Dict[str, Any]:
    ctx = deepcopy(base)

    agreement_date_long = format_date_for_template(ctx.get("agreement_date"))
    closing_date_long = format_date_for_template(ctx.get("closing_date"))

    seller_name = str(ctx.get("seller_name") or "")
    buyer_name = str(ctx.get("buyer_name") or "")
    seller_address = str(ctx.get("seller_address") or "")
    buyer_address = str(ctx.get("buyer_address") or "")
    business_name = str(ctx.get("business_name") or "")
    state = str(ctx.get("state") or "")

    purchase_price_formatted = format_currency(ctx.get("purchase_price"))
    deposit_amount_formatted = format_currency(ctx.get("deposit_amount"))
    cash_at_closing_formatted = format_currency(ctx.get("cash_at_closing"))
    seller_financing_amount_formatted = format_currency(
        ctx.get("seller_financing_amount")
    )

    included_assets_bullets = build_assets_bullets(ctx.get("included_assets_text"))
    excluded_assets_bullets = build_assets_bullets(ctx.get("excluded_assets_text"))
    equipment_items = parse_equipment_items(ctx.get("equipment_items_text"))

    ctx["business_name"] = business_name
    ctx["state"] = state

    ctx["seller"] = {
        "name": seller_name,
        "address": seller_address,
    }

    ctx["buyer"] = {
        "name": buyer_name,
        "address": buyer_address,
    }

    ctx["purchase_terms"] = {
        "closing_date": closing_date_long,
        "purchase_price": purchase_price_formatted,
        "deposit_amount": deposit_amount_formatted,
        "cash_at_closing": cash_at_closing_formatted,
        "seller_financing_amount": seller_financing_amount_formatted,
        "summary": build_purchase_terms_text(ctx),
    }

    ctx["restrictive_covenants"] = {
        "non_compete_years": ctx.get("non_compete_years") or "",
        "non_compete_miles": ctx.get("non_compete_miles") or "",
        "summary": build_restrictive_covenants_text(ctx),
    }

    ctx["transferred_assets_summary"] = included_assets_bullets
    ctx["excluded_assets_summary"] = excluded_assets_bullets
    ctx["equipment_items"] = equipment_items

    # 추가 alias
    ctx["agreement_date_long"] = agreement_date_long
    ctx["closing_date_long"] = closing_date_long
    ctx["purchase_price_formatted"] = purchase_price_formatted
    ctx["bill_of_sale_date"] = agreement_date_long
    ctx["transfer_date"] = closing_date_long

    if not ctx["equipment_items"]:
        ctx["equipment_items"] = [
            {
                "description": "",
                "serial_number": "",
                "condition": "",
                "line_no": "",
                "item_name": "",
                "quantity": "",
                "notes": "",
            }
        ]

    return ctx