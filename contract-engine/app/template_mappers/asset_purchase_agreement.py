from __future__ import annotations

from copy import deepcopy
from typing import Any, Dict

from .common import (
    build_purchase_terms_text,
    build_restrictive_covenants_text,
    build_assets_bullets,
    format_currency,
    format_date_for_template,
    parse_checklist_items,
    parse_equipment_items,
)


def build_asset_purchase_agreement_context(base: Dict[str, Any]) -> Dict[str, Any]:
    ctx = deepcopy(base)

    ctx["agreement_date_long"] = format_date_for_template(ctx.get("agreement_date"))
    ctx["closing_date_long"] = format_date_for_template(ctx.get("closing_date"))

    ctx["equipment_items"] = parse_equipment_items(ctx.get("equipment_items_text"))
    ctx["closing_checklist_items"] = parse_checklist_items(
        ctx.get("closing_checklist_text")
    )

    ctx["purchase_price"] = format_currency(ctx.get("purchase_price"))
    ctx["deposit_amount"] = format_currency(ctx.get("deposit_amount"))
    ctx["cash_at_closing"] = format_currency(ctx.get("cash_at_closing"))
    ctx["seller_financing_amount"] = format_currency(
        ctx.get("seller_financing_amount")
    )

    ctx["included_assets_text"] = "\n".join(
        build_assets_bullets(ctx.get("included_assets_text"))
    )
    ctx["excluded_assets_text"] = "\n".join(
        build_assets_bullets(ctx.get("excluded_assets_text"))
    )

    ctx["allocated_inventory"] = format_currency(ctx.get("allocated_inventory"))
    ctx["allocated_ffe"] = format_currency(ctx.get("allocated_ffe"))
    ctx["allocated_goodwill"] = format_currency(ctx.get("allocated_goodwill"))
    ctx["allocation_total"] = format_currency(ctx.get("allocation_total"))

    ctx["seller_financing_clause"] = (
        str(ctx.get("seller_financing_clause") or "").strip()
    )

    ctx["state"] = str(ctx.get("state") or "")
    ctx["non_compete_years"] = ctx.get("non_compete_years") or ""
    ctx["non_compete_miles"] = ctx.get("non_compete_miles") or ""

    # 보조 alias
    ctx["purchase_terms_text"] = build_purchase_terms_text(ctx)
    ctx["restrictive_covenants_text"] = build_restrictive_covenants_text(ctx)

    # equipment loop 최소 1행 보장
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