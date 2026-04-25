from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List

from docxtpl import RichText


def _string(value: Any) -> str:
    if value is None:
        return ""
    return str(value).strip()


def _number(value: Any) -> float:
    if value is None or value == "":
        return 0.0

    if isinstance(value, (int, float)):
        return float(value)

    text = str(value).strip().replace("$", "").replace(",", "")
    if text == "":
        return 0.0

    try:
        return float(text)
    except ValueError:
        return 0.0


def _format_currency(value: Any) -> str:
    amount = _number(value)
    return f"${amount:,.0f}"


def _format_date_long(value: Any) -> str:
    text = _string(value)
    if not text:
        return ""

    for fmt in ("%Y-%m-%d", "%m/%d/%Y", "%Y/%m/%d"):
        try:
            dt = datetime.strptime(text, fmt)
            return dt.strftime("%B %d, %Y")
        except ValueError:
            continue

    return text


def _split_text_items(value: Any) -> List[str]:
    """
    Supports:
    - comma-separated text
    - newline-separated text
    """
    text = _string(value)
    if not text:
        return []

    normalized = text.replace("\r\n", "\n")
    if "\n" in normalized:
        parts = [p.strip() for p in normalized.split("\n")]
    else:
        parts = [p.strip() for p in normalized.split(",")]

    return [p for p in parts if p]


def _build_bulleted_rich_text(items: List[str]) -> RichText:
    rt = RichText()
    if not items:
      rt.add("")
      return rt

    for idx, item in enumerate(items):
        if idx > 0:
            rt.add("\n")
        rt.add(f"• {item}")
    return rt


def _parse_equipment_items(value: Any) -> List[Dict[str, str]]:
    """
    Expected line format:
      description | serial | condition

    Example:
      12 wall-mounted shelving units | none | Good
      6 gondola display racks | none | Excellent
    """
    lines = _split_text_items(value)
    items: List[Dict[str, str]] = []

    for line in lines:
        parts = [p.strip() for p in line.split("|")]
        if len(parts) >= 3:
            description, serial_number, condition = parts[0], parts[1], parts[2]
        elif len(parts) == 2:
            description, serial_number = parts[0], parts[1]
            condition = ""
        else:
            description = parts[0]
            serial_number = ""
            condition = ""

        items.append(
            {
                "description": description,
                "serial_number": serial_number or "none",
                "condition": condition,
            }
        )

    return items


def _parse_checklist_items(value: Any) -> List[str]:
    return _split_text_items(value)


def _build_seller_financing_clause(deal: Dict[str, Any]) -> str:
    amount = _number(deal.get("seller_financing_amount"))
    if amount <= 0:
        return ""

    return (
        f"The Seller agrees to finance {_format_currency(amount)} of the Purchase Price "
        f"on the terms set forth in a separate Promissory Note to be executed at Closing."
    )


def build_asset_purchase_agreement_context(deal: Dict[str, Any]) -> Dict[str, Any]:
    included_assets = _split_text_items(deal.get("included_assets_text"))
    excluded_assets = _split_text_items(deal.get("excluded_assets_text"))
    equipment_items = _parse_equipment_items(deal.get("equipment_items_text"))
    closing_checklist_items = _parse_checklist_items(deal.get("closing_checklist_text"))

    allocated_inventory = _number(deal.get("allocated_inventory"))
    allocated_ffe = _number(deal.get("allocated_ffe"))
    allocated_goodwill = _number(deal.get("allocated_goodwill"))
    allocation_total = allocated_inventory + allocated_ffe + allocated_goodwill

    return {
        "business_name": _string(deal.get("business_name")),
        "seller_name": _string(deal.get("seller_name")),
        "seller_address": _string(deal.get("seller_address")),
        "buyer_name": _string(deal.get("buyer_name")),
        "buyer_address": _string(deal.get("buyer_address")),

        "agreement_date_long": _format_date_long(deal.get("agreement_date")),
        "closing_date_long": _format_date_long(deal.get("closing_date")),

        "included_assets_text": _build_bulleted_rich_text(included_assets),
        "excluded_assets_text": _build_bulleted_rich_text(excluded_assets),

        "purchase_price": _format_currency(deal.get("purchase_price")),
        "deposit_amount": _format_currency(deal.get("deposit_amount")),
        "cash_at_closing": _format_currency(deal.get("cash_at_closing")),
        "seller_financing_amount": _format_currency(deal.get("seller_financing_amount")),
        "seller_financing_clause": _build_seller_financing_clause(deal),

        "allocated_inventory": _format_currency(allocated_inventory),
        "allocated_ffe": _format_currency(allocated_ffe),
        "allocated_goodwill": _format_currency(allocated_goodwill),
        "allocation_total": _format_currency(allocation_total),

        "non_compete_years": _string(deal.get("non_compete_years")),
        "non_compete_miles": _string(deal.get("non_compete_miles")),
        "state": _string(deal.get("state")),

        "equipment_items": equipment_items,
        "closing_checklist_items": closing_checklist_items,
    }