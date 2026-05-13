import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";

function normalizeNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;

  const parsed =
    typeof value === "number"
      ? value
      : Number(String(value).replace(/[$,]/g, ""));

  return Number.isNaN(parsed) ? null : parsed;
}

function normalizeText(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text === "" ? null : text;
}

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

  const body = await request.json();

  const insertPayload = {
    user_id: user.id,

    business_name: normalizeText(body.business_name),
    business_type: normalizeText(body.business_type),
    business_location: normalizeText(body.business_location),
    closing_method: normalizeText(body.closing_method),

    purchase_price: normalizeNumber(body.purchase_price),
    down_payment: normalizeNumber(body.down_payment),
    seller_financing: Boolean(body.seller_financing ?? false),

    seller_name: normalizeText(body.seller_name),
    seller_address: normalizeText(body.seller_address),
    seller_state_of_organization: normalizeText(body.seller_state_of_organization),
    seller_ein: normalizeText(body.seller_ein),

    buyer_name: normalizeText(body.buyer_name),
    buyer_address: normalizeText(body.buyer_address),
    buyer_state_of_organization: normalizeText(body.buyer_state_of_organization),

    agreement_date: normalizeText(body.agreement_date),
    closing_date: normalizeText(body.closing_date),

    included_assets_text: normalizeText(body.included_assets_text),
    excluded_assets_text: normalizeText(body.excluded_assets_text),
    assumed_liabilities_text: normalizeText(body.assumed_liabilities_text),
    excluded_liabilities_text: normalizeText(body.excluded_liabilities_text),

    deposit_amount: normalizeNumber(body.deposit_amount),
    cash_at_closing: normalizeNumber(body.cash_at_closing),
    seller_financing_amount: normalizeNumber(body.seller_financing_amount),
    seller_financing_clause: normalizeText(body.seller_financing_clause),

    promissory_interest_rate: normalizeNumber(body.promissory_interest_rate),
    promissory_term_months: normalizeNumber(body.promissory_term_months),
    promissory_first_payment_date: normalizeText(body.promissory_first_payment_date),
    promissory_maturity_date: normalizeText(body.promissory_maturity_date),

    allocated_inventory: normalizeNumber(body.allocated_inventory),
    allocated_ffe: normalizeNumber(body.allocated_ffe),
    allocated_leasehold: normalizeNumber(body.allocated_leasehold),
    allocated_customer_contracts: normalizeNumber(body.allocated_customer_contracts),
    allocated_trade_name: normalizeNumber(body.allocated_trade_name),
    allocated_non_compete: normalizeNumber(body.allocated_non_compete),
    allocated_goodwill: normalizeNumber(body.allocated_goodwill),
    allocation_total: normalizeNumber(body.allocation_total),

    state: normalizeText(body.state),

    non_compete_years: normalizeNumber(body.non_compete_years),
    non_compete_miles: normalizeNumber(body.non_compete_miles),
    non_compete_restricted_business: normalizeText(body.non_compete_restricted_business),
    non_compete_territory: normalizeText(body.non_compete_territory),

    equipment_items_text: normalizeText(body.equipment_items_text),
    closing_checklist_text: normalizeText(body.closing_checklist_text),
  };

  const { data, error } = await supabase
    .from("deals")
    .insert(insertPayload)
    .select("*")
    .single();

  if (error) {
    console.error("Create deal error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create deal." },
      { status: 500 }
    );
  }

  return NextResponse.json({ deal: data }, { status: 201 });
}
