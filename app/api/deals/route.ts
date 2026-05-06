import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";

export async function GET() {
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
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[deals][GET] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load deals." },
      { status: 500 }
    );
  }

  return NextResponse.json({ deals: data ?? [] });
}

export async function POST(request: Request) {
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
    body = {};
  }

  const businessName =
    typeof body.business_name === "string" && body.business_name.trim() !== ""
      ? body.business_name.trim()
      : "Untitled Deal";

  const purchasePrice =
    typeof body.purchase_price === "number" ? body.purchase_price : null;

  const downPayment =
    typeof body.down_payment === "number" ? body.down_payment : null;

  const sellerFinancing =
    typeof body.seller_financing === "boolean" ? body.seller_financing : false;

  const insertPayload = {
    user_id: user.id,
    business_name: businessName,
    purchase_price: purchasePrice,
    down_payment: downPayment,
    seller_financing: sellerFinancing,

    seller_name:
      typeof body.seller_name === "string" ? body.seller_name.trim() || null : null,
    seller_address:
      typeof body.seller_address === "string"
        ? body.seller_address.trim() || null
        : null,
    buyer_name:
      typeof body.buyer_name === "string" ? body.buyer_name.trim() || null : null,
    buyer_address:
      typeof body.buyer_address === "string"
        ? body.buyer_address.trim() || null
        : null,
    agreement_date:
      typeof body.agreement_date === "string"
        ? body.agreement_date.trim() || null
        : null,
    closing_date:
      typeof body.closing_date === "string"
        ? body.closing_date.trim() || null
        : null,

    included_assets_text:
      typeof body.included_assets_text === "string"
        ? body.included_assets_text.trim() || null
        : null,
    excluded_assets_text:
      typeof body.excluded_assets_text === "string"
        ? body.excluded_assets_text.trim() || null
        : null,
    deposit_amount:
      typeof body.deposit_amount === "number" ? body.deposit_amount : null,
    cash_at_closing:
      typeof body.cash_at_closing === "number" ? body.cash_at_closing : null,
    seller_financing_amount:
      typeof body.seller_financing_amount === "number"
        ? body.seller_financing_amount
        : null,
    seller_financing_clause:
      typeof body.seller_financing_clause === "string"
        ? body.seller_financing_clause.trim() || null
        : null,
    allocated_inventory:
      typeof body.allocated_inventory === "number"
        ? body.allocated_inventory
        : null,
    allocated_ffe:
      typeof body.allocated_ffe === "number" ? body.allocated_ffe : null,
    
    allocated_leasehold:
      body.allocated_leasehold === null
        ? null
        : body.allocated_leasehold !== undefined
        ? Number(body.allocated_leasehold)
        : undefined,
    allocated_customer_contracts:
      body.allocated_customer_contracts === null
        ? null
        : body.allocated_customer_contracts !== undefined
        ? Number(body.allocated_customer_contracts)
        : undefined,
    allocated_trade_name:
      body.allocated_trade_name === null
        ? null
        : body.allocated_trade_name !== undefined
        ? Number(body.allocated_trade_name)
        : undefined,

    allocated_non_compete:
      body.allocated_non_compete === null
        ? null
        : body.allocated_non_compete !== undefined
        ? Number(body.allocated_non_compete)
        : undefined,
    allocated_goodwill:
      typeof body.allocated_goodwill === "number"
        ? body.allocated_goodwill
        : null,
    allocation_total:
      typeof body.allocation_total === "number" ? body.allocation_total : null,
    state: typeof body.state === "string" ? body.state.trim() || null : null,
    non_compete_years:
      typeof body.non_compete_years === "number"
        ? body.non_compete_years
        : null,
    non_compete_miles:
      typeof body.non_compete_miles === "number"
        ? body.non_compete_miles
        : null,

    equipment_items_text:
      typeof body.equipment_items_text === "string"
        ? body.equipment_items_text.trim() || null
        : null,
    closing_checklist_text:
      typeof body.closing_checklist_text === "string"
        ? body.closing_checklist_text.trim() || null
        : null,

    deal_name: body.deal_name ?? null,
    business_type: body.business_type ?? null,
    buyer_state_of_organization: body.buyer_state_of_organization ?? null,
    seller_state_of_organization: body.seller_state_of_organization ?? null,
    seller_ein: body.seller_ein ?? null,
    business_location: body.business_location ?? null,
    closing_method: body.closing_method ?? null,

    assumed_liabilities_text: body.assumed_liabilities_text ?? null,
    excluded_liabilities_text: body.excluded_liabilities_text ?? null,
    promissory_note_terms_text: body.promissory_note_terms_text ?? null,
    non_compete_restricted_party: body.non_compete_restricted_party ?? null,
    non_compete_restricted_business: body.non_compete_restricted_business ?? null,
    non_compete_territory: body.non_compete_territory ?? null,
    landlord_consent_text: body.landlord_consent_text ?? null,
    lease_assignment_text: body.lease_assignment_text ?? null,

    promissory_interest_rate:
      body.promissory_interest_rate !== undefined ? Number(body.promissory_interest_rate) : null,
    promissory_term_months:
      body.promissory_term_months !== undefined ? Number(body.promissory_term_months) : null,
    non_solicitation_years:
      body.non_solicitation_years !== undefined ? Number(body.non_solicitation_years) : null,

    landlord_consent_required: Boolean(body.landlord_consent_required ?? false),
    lease_assignment_required: Boolean(body.lease_assignment_required ?? false),

  };

  const { data, error } = await supabase
    .from("deals")
    .insert(insertPayload)
    .select("*")
    .single();

  if (error) {
    console.error("[deals][POST] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create deal." },
      { status: 500 }
    );
  }

  return NextResponse.json({ deal: data }, { status: 201 });
}