from __future__ import annotations

from typing import Any, Dict, List
from datetime import date, datetime


def format_date_for_template(value: Any) -> str:
    if value is None or value == "":
        return ""

    if isinstance(value, datetime):
        return value.strftime("%B %d, %Y")

    if isinstance(value, date):
        return value.strftime("%B %d, %Y")

    if isinstance(value, str):
        normalized = value.strip()
        if not normalized:
            return ""

        try:
            dt = datetime.strptime(normalized, "%Y-%m-%d")
            return dt.strftime("%B %d, %Y")
        except ValueError:
            pass

        try:
            dt = datetime.fromisoformat(normalized.replace("Z", "+00:00"))
            return dt.strftime("%B %d, %Y")
        except ValueError:
            pass

        return normalized

    return str(value)


def format_currency(value: Any) -> str:
    if value is None or value == "":
        return ""

    try:
        number = float(value)
        if number.is_integer():
            return f"${int(number):,}"
        return f"${number:,.2f}"
    except Exception:
        return str(value)


def parse_equipment_items(raw: Any) -> List[Dict[str, str]]:
    if raw is None:
        return []

    text = str(raw).strip()
    if not text:
        return []

    items: List[Dict[str, str]] = []

    for idx, line in enumerate(text.splitlines(), start=1):
        line = line.strip()
        if not line:
            continue

        parts = [part.strip() for part in line.split("|")]
        description = parts[0] if len(parts) > 0 else ""
        serial_number = parts[1] if len(parts) > 1 else ""
        condition = parts[2] if len(parts) > 2 else ""

        notes_parts = []
        if serial_number:
            notes_parts.append(f"Serial / ID: {serial_number}")
        if condition:
            notes_parts.append(f"Condition: {condition}")

        items.append(
            {
                "description": description,
                "serial_number": serial_number,
                "condition": condition,
                "line_no": str(idx),
                "item_name": description,
                "quantity": "1",
                "notes": "; ".join(notes_parts),
            }
        )

    return items


def parse_checklist_items(raw: Any) -> List[str]:
    if raw is None:
        return []

    text = str(raw).strip()
    if not text:
        return []

    return [line.strip() for line in text.splitlines() if line.strip()]


def build_assets_bullets(raw: Any) -> List[str]:
    if raw is None:
        return []

    text = str(raw).strip()
    if not text:
        return []

    return [line.strip() for line in text.splitlines() if line.strip()]


def build_purchase_terms_text(base: Dict[str, Any]) -> str:
    deposit_amount = format_currency(base.get("deposit_amount"))
    cash_at_closing = format_currency(base.get("cash_at_closing"))
    seller_financing_amount = format_currency(base.get("seller_financing_amount"))
    seller_financing_clause = str(base.get("seller_financing_clause") or "").strip()

    terms: List[str] = []

    if deposit_amount:
        terms.append(f"Deposit: {deposit_amount}")
    if cash_at_closing:
        terms.append(f"Cash at Closing: {cash_at_closing}")
    if seller_financing_amount:
        terms.append(f"Seller Financing: {seller_financing_amount}")
    if seller_financing_clause:
        terms.append(seller_financing_clause)

    if terms:
        return "; ".join(terms)

    purchase_price = format_currency(base.get("purchase_price"))
    if purchase_price:
        return f"Total purchase price: {purchase_price}"

    return ""


def build_restrictive_covenants_text(base: Dict[str, Any]) -> str:
    years = base.get("non_compete_years")
    miles = base.get("non_compete_miles")

    has_years = years not in (None, "", 0)
    has_miles = miles not in (None, "", 0)

    if has_years and has_miles:
        return (
            f"Seller agrees that for {years} year(s) following Closing, and within "
            f"a radius of {miles} mile(s) from the Business, Seller shall not "
            f"directly or indirectly compete with the Business."
        )

    if has_years:
        return (
            f"Seller agrees that for {years} year(s) following Closing, Seller shall "
            f"not directly or indirectly compete with the Business."
        )

    if has_miles:
        return (
            f"Seller agrees that within a radius of {miles} mile(s) from the Business, "
            f"Seller shall not directly or indirectly compete with the Business."
        )

    return ""