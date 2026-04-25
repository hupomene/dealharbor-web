from typing import Any, Dict


def _string(value: Any) -> str:
    if value is None:
        return ""
    return str(value).strip()


def _number_or_string(value: Any) -> str:
    if value is None:
        return ""
    return str(value).strip()


def build_non_compete_context(deal: Dict[str, Any]) -> Dict[str, Any]:
    """
    Build context that matches the uploaded non-compete template exactly.

    Expected template variables:
      - agreement_title
      - restricted_state
      - purchase_terms.closing_date
      - restricted_party
      - benefited_party
      - restricted_business_name
      - restricted_term_years
      - restricted_radius_miles
    """
    return {
        "agreement_title": "Non-Compete Agreement",
        "restricted_state": _string(deal.get("state")),
        "purchase_terms": {
            "closing_date": _string(deal.get("closing_date")),
        },
        "restricted_party": _string(deal.get("seller_name")),
        "benefited_party": _string(deal.get("buyer_name")),
        "restricted_business_name": _string(deal.get("business_name")),
        "restricted_term_years": _number_or_string(deal.get("non_compete_years")),
        "restricted_radius_miles": _number_or_string(deal.get("non_compete_miles")),
    }