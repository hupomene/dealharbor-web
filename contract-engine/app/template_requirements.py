from __future__ import annotations

from typing import Any, Dict, List


TEMPLATE_REQUIREMENTS: dict[str, list[tuple[str, str]]] = {
    "asset_purchase_agreement": [
        ("business_name", "Business Name"),
        ("seller_name", "Seller Name"),
        ("buyer_name", "Buyer Name"),
        ("agreement_date", "Agreement Date"),
        ("closing_date", "Closing Date"),
        ("purchase_price", "Purchase Price"),
        ("state", "State"),
    ],
    "bill_of_sale": [
        ("business_name", "Business Name"),
        ("seller_name", "Seller Name"),
        ("buyer_name", "Buyer Name"),
        ("seller_address", "Seller Address"),
        ("buyer_address", "Buyer Address"),
        ("closing_date", "Closing Date"),
        ("purchase_price", "Purchase Price"),
        ("state", "State"),
    ],
    "promissory_note": [
        ("business_name", "Business Name"),
        ("seller_name", "Seller Name"),
        ("buyer_name", "Buyer Name"),
        ("state", "State"),
    ],
    "non_compete": [
        ("business_name", "Business Name"),
        ("seller_name", "Seller Name"),
        ("buyer_name", "Buyer Name"),
        ("closing_date", "Closing Date"),
        ("state", "State"),
        ("non_compete_years", "Non-Compete Years"),
        ("non_compete_miles", "Non-Compete Miles"),
    ],
}


def _is_missing(value: Any) -> bool:
    if value is None:
        return True

    if isinstance(value, str):
        return value.strip() == ""

    return False


def validate_template_payload(
    template_key: str,
    data: Dict[str, Any],
) -> List[Dict[str, str]]:
    requirements = TEMPLATE_REQUIREMENTS.get(template_key, [])
    missing: List[Dict[str, str]] = []

    for field_key, label in requirements:
        if _is_missing(data.get(field_key)):
            missing.append(
                {
                    "field": field_key,
                    "label": label,
                }
            )

    return missing


def validate_payloads(
    payloads: list[Any],
) -> List[Dict[str, Any]]:
    validation_errors: List[Dict[str, Any]] = []

    for payload in payloads:
        template_key = payload.templateKey
        missing = validate_template_payload(template_key, payload.data)

        if missing:
            validation_errors.append(
                {
                    "template_key": template_key,
                    "document_name": payload.documentName,
                    "missing_fields": missing,
                }
            )

    return validation_errors