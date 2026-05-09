import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";

type RouteContext = {
  params: Promise<{
    dealId: string;
  }>;
};

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() || null : null;
}

function normalizeNumber(value: unknown) {
  return typeof value === "number" && !Number.isNaN(value) ? value : null;
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { dealId } = await params;
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("deals")
    .select("*")
    .eq("id", dealId)
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    console.error("[deal][GET] error:", error);
    return NextResponse.json({ error: "Deal not found." }, { status: 404 });
  }

  return NextResponse.json({ deal: data });
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { dealId } = await params;
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown> = {};

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const updatePayload = {
    business_name:
      typeof body.business_name === "string"
        ? body.business_name.trim() || null
        : undefined,
    purchase_price:
      body.purchase_price === null
        ? null
        : body.purchase_price !== undefined
        ? normalizeNumber(body.purchase_price)
        : undefined,
    down_payment:
      body.down_payment === null
        ? null
        : body.down_payment !== undefined
        ? normalizeNumber(body.down_payment)
        : undefined,
    seller_financing:
      typeof body.seller_financing === "boolean"
        ? body.seller_financing
        : undefined,

    deal_name:
      body.deal_name === null
        ? null
        : body.deal_name !== undefined
        ? normalizeString(body.deal_name)
        : undefined,

    business_type:
      body.business_type === null
        ? null
        : body.business_type !== undefined
        ? normalizeString(body.business_type)
        : undefined,

    buyer_state_of_organization:
      body.buyer_state_of_organization === null
        ? null
        : body.buyer_state_of_organization !== undefined
        ? normalizeString(body.buyer_state_of_organization)
        : undefined,

    seller_state_of_organization:
      body.seller_state_of_organization === null
        ? null
        : body.seller_state_of_organization !== undefined
        ? normalizeString(body.seller_state_of_organization)
        : undefined,

    seller_ein:
      body.seller_ein === null
        ? null
        : body.seller_ein !== undefined
        ? normalizeString(body.seller_ein)
        : undefined,

    business_location:
      body.business_location === null
        ? null
        : body.business_location !== undefined
        ? normalizeString(body.business_location)
        : undefined,

    closing_method:
      body.closing_method === null
        ? null
        : body.closing_method !== undefined
        ? normalizeString(body.closing_method)
        : undefined,

    seller_name:
      body.seller_name !== undefined ? normalizeString(body.seller_name) : undefined,
    seller_address:
      body.seller_address !== undefined
        ? normalizeString(body.seller_address)
        : undefined,
    buyer_name:
      body.buyer_name !== undefined ? normalizeString(body.buyer_name) : undefined,
    buyer_address:
      body.buyer_address !== undefined
        ? normalizeString(body.buyer_address)
        : undefined,
    agreement_date:
      body.agreement_date !== undefined
        ? normalizeString(body.agreement_date)
        : undefined,
    closing_date:
      body.closing_date !== undefined
        ? normalizeString(body.closing_date)
        : undefined,

    included_assets_text:
      body.included_assets_text !== undefined
        ? normalizeString(body.included_assets_text)
        : undefined,

    assumed_liabilities_text:
      body.assumed_liabilities_text === null
        ? null
        : body.assumed_liabilities_text !== undefined
        ? body.assumed_liabilities_text
        : undefined,

    excluded_liabilities_text:
      body.excluded_liabilities_text === null
        ? null
        : body.excluded_liabilities_text !== undefined
        ? body.excluded_liabilities_text
        : undefined,

    promissory_note_terms_text:
      body.promissory_note_terms_text === null
        ? null
        : body.promissory_note_terms_text !== undefined
        ? body.promissory_note_terms_text
        : undefined,

    non_compete_restricted_party:
      body.non_compete_restricted_party === null
        ? null
        : body.non_compete_restricted_party !== undefined
        ? body.non_compete_restricted_party
        : undefined,

    non_compete_restricted_business:
      body.non_compete_restricted_business === null
        ? null
        : body.non_compete_restricted_business !== undefined
        ? body.non_compete_restricted_business
        : undefined,

    non_compete_territory:
      body.non_compete_territory === null
        ? null
        : body.non_compete_territory !== undefined
        ? body.non_compete_territory
        : undefined,

    landlord_consent_text:
      body.landlord_consent_text === null
        ? null
        : body.landlord_consent_text !== undefined
        ? body.landlord_consent_text
        : undefined,

    lease_assignment_text:
      body.lease_assignment_text === null
        ? null
        : body.lease_assignment_text !== undefined
        ? body.lease_assignment_text
        : undefined,

    excluded_assets_text:
      body.excluded_assets_text !== undefined
        ? normalizeString(body.excluded_assets_text)
        : undefined,
    deposit_amount:
      body.deposit_amount === null
        ? null
        : body.deposit_amount !== undefined
        ? normalizeNumber(body.deposit_amount)
        : undefined,
    cash_at_closing:
      body.cash_at_closing === null
        ? null
        : body.cash_at_closing !== undefined
        ? normalizeNumber(body.cash_at_closing)
        : undefined,
    seller_financing_amount:
      body.seller_financing_amount === null
        ? null
        : body.seller_financing_amount !== undefined
        ? normalizeNumber(body.seller_financing_amount)
        : undefined,
    seller_financing_clause:
      body.seller_financing_clause !== undefined
        ? normalizeString(body.seller_financing_clause)
        : undefined,
    allocated_inventory:
      body.allocated_inventory === null
        ? null
        : body.allocated_inventory !== undefined
        ? normalizeNumber(body.allocated_inventory)
        : undefined,
    allocated_ffe:
      body.allocated_ffe === null
        ? null
        : body.allocated_ffe !== undefined
        ? normalizeNumber(body.allocated_ffe)
        : undefined,
    allocated_leasehold:
      body.allocated_leasehold === null
        ? null
        : body.allocated_leasehold !== undefined
        ? normalizeNumber(body.allocated_leasehold)
        : undefined,
    allocated_customer_contracts:
      body.allocated_customer_contracts === null
        ? null
        : body.allocated_customer_contracts !== undefined
        ? normalizeNumber(body.allocated_customer_contracts)
        : undefined,
    allocated_trade_name:
      body.allocated_trade_name === null
        ? null
        : body.allocated_trade_name !== undefined
        ? normalizeNumber(body.allocated_trade_name)
        : undefined,
    allocated_non_compete:
      body.allocated_non_compete === null
        ? null
        : body.allocated_non_compete !== undefined
        ? normalizeNumber(body.allocated_non_compete)
        : undefined,
    allocated_goodwill:
      body.allocated_goodwill === null
        ? null
        : body.allocated_goodwill !== undefined
        ? normalizeNumber(body.allocated_goodwill)
        : undefined,

    promissory_interest_rate:
      body.promissory_interest_rate === null
        ? null
        : body.promissory_interest_rate !== undefined
        ? normalizeNumber(body.promissory_interest_rate)
        : undefined,

    promissory_term_months:
      body.promissory_term_months === null
        ? null
        : body.promissory_term_months !== undefined
        ? normalizeNumber(body.promissory_term_months)
        : undefined,

    non_solicitation_years:
      body.non_solicitation_years === null
        ? null
        : body.non_solicitation_years !== undefined
        ? normalizeNumber(body.non_solicitation_years)
        : undefined,

    landlord_consent_required:
      body.landlord_consent_required !== undefined
        ? Boolean(body.landlord_consent_required)
        : undefined,

    lease_assignment_required:
      body.lease_assignment_required !== undefined
        ? Boolean(body.lease_assignment_required)
        : undefined,

    allocation_total:
      body.allocation_total === null
        ? null
        : body.allocation_total !== undefined
        ? normalizeNumber(body.allocation_total)
        : undefined,
    state: body.state !== undefined ? normalizeString(body.state) : undefined,
    non_compete_years:
      body.non_compete_years === null
        ? null
        : body.non_compete_years !== undefined
        ? normalizeNumber(body.non_compete_years)
        : undefined,
    non_compete_miles:
      body.non_compete_miles === null
        ? null
        : body.non_compete_miles !== undefined
        ? normalizeNumber(body.non_compete_miles)
        : undefined,

    equipment_items_text:
      body.equipment_items_text !== undefined
        ? normalizeString(body.equipment_items_text)
        : undefined,
    closing_checklist_text:
      body.closing_checklist_text !== undefined
        ? normalizeString(body.closing_checklist_text)
        : undefined,

    promissory_first_payment_date:
      body.promissory_first_payment_date === null
        ? null
        : body.promissory_first_payment_date !== undefined
        ? normalizeString(body.promissory_first_payment_date)
        : undefined,

    promissory_maturity_date:
      body.promissory_maturity_date === null
        ? null
        : body.promissory_maturity_date !== undefined
        ? normalizeString(body.promissory_maturity_date)
        : undefined,

  };

  const cleanPayload = Object.fromEntries(
    Object.entries(updatePayload).filter(([, value]) => value !== undefined)
  );

  const { data, error } = await supabase
    .from("deals")
    .update(cleanPayload)
    .eq("id", dealId)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error || !data) {
    console.error("[deal][PATCH] error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update deal." },
      { status: 500 }
    );
  }

  return NextResponse.json({ deal: data });
}