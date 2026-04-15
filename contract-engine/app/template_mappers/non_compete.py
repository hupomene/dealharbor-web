from __future__ import annotations

from copy import deepcopy
from typing import Any, Dict

from .common import format_date_for_template


def build_non_compete_context(base: Dict[str, Any]) -> Dict[str, Any]:
    ctx = deepcopy(base)

    seller_name = str(ctx.get("seller_name") or "")
    buyer_name = str(ctx.get("buyer_name") or "")
    business_name = str(ctx.get("business_name") or "")
    state = str(ctx.get("state") or "")

    non_compete_years = ctx.get("non_compete_years") or ""
    non_compete_miles = ctx.get("non_compete_miles") or ""

    closing_date_long = format_date_for_template(ctx.get("closing_date"))

    # 핵심 매핑
    ctx["agreement_title"] = "NON-COMPETE AGREEMENT"

    ctx["restricted_party"] = seller_name
    ctx["benefited_party"] = buyer_name

    ctx["restricted_business_name"] = business_name
    ctx["restricted_state"] = state

    ctx["restricted_term_years"] = non_compete_years
    ctx["restricted_radius_miles"] = non_compete_miles

    # nested 구조 (중요)
    ctx["purchase_terms"] = {
        "closing_date": closing_date_long
    }

    return ctx