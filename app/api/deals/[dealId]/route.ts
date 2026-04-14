import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";

type RouteContext = {
  params: Promise<{
    dealId: string;
  }>;
};

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

  let body: any;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  console.log("[deals][PATCH] incoming body:", JSON.stringify(body, null, 2));

  const updates = {
    business_name:
      typeof body.business_name === "string" ? body.business_name : null,
    purchase_price:
      typeof body.purchase_price === "number" ? body.purchase_price : null,
    down_payment:
      typeof body.down_payment === "number" ? body.down_payment : null,
    seller_financing:
      typeof body.seller_financing === "boolean" ? body.seller_financing : false,

    seller_name:
      typeof body.seller_name === "string" && body.seller_name.trim() !== ""
        ? body.seller_name
        : null,
    seller_address:
      typeof body.seller_address === "string" && body.seller_address.trim() !== ""
        ? body.seller_address
        : null,
    buyer_name:
      typeof body.buyer_name === "string" && body.buyer_name.trim() !== ""
        ? body.buyer_name
        : null,
    buyer_address:
      typeof body.buyer_address === "string" && body.buyer_address.trim() !== ""
        ? body.buyer_address
        : null,

    agreement_date:
      typeof body.agreement_date === "string" && body.agreement_date.trim() !== ""
        ? body.agreement_date
        : null,
    closing_date:
      typeof body.closing_date === "string" && body.closing_date.trim() !== ""
        ? body.closing_date
        : null,

    included_assets_text:
      typeof body.included_assets_text === "string" &&
      body.included_assets_text.trim() !== ""
        ? body.included_assets_text
        : null,
    excluded_assets_text:
      typeof body.excluded_assets_text === "string" &&
      body.excluded_assets_text.trim() !== ""
        ? body.excluded_assets_text
        : null,

    deposit_amount:
      typeof body.deposit_amount === "number" && !Number.isNaN(body.deposit_amount)
        ? body.deposit_amount
        : null,
    cash_at_closing:
      typeof body.cash_at_closing === "number" && !Number.isNaN(body.cash_at_closing)
        ? body.cash_at_closing
        : null,
    seller_financing_amount:
      typeof body.seller_financing_amount === "number" &&
      !Number.isNaN(body.seller_financing_amount)
        ? body.seller_financing_amount
        : null,

    seller_financing_clause:
      typeof body.seller_financing_clause === "string" &&
      body.seller_financing_clause.trim() !== ""
        ? body.seller_financing_clause
        : null,

    allocated_inventory:
      typeof body.allocated_inventory === "number" &&
      !Number.isNaN(body.allocated_inventory)
        ? body.allocated_inventory
        : null,
    allocated_ffe:
      typeof body.allocated_ffe === "number" && !Number.isNaN(body.allocated_ffe)
        ? body.allocated_ffe
        : null,
    allocated_goodwill:
      typeof body.allocated_goodwill === "number" &&
      !Number.isNaN(body.allocated_goodwill)
        ? body.allocated_goodwill
        : null,
    allocation_total:
      typeof body.allocation_total === "number" &&
      !Number.isNaN(body.allocation_total)
        ? body.allocation_total
        : null,

    state:
      typeof body.state === "string" && body.state.trim() !== ""
        ? body.state
        : null,
    non_compete_years:
      typeof body.non_compete_years === "number" &&
      !Number.isNaN(body.non_compete_years)
        ? body.non_compete_years
        : null,
    non_compete_miles:
      typeof body.non_compete_miles === "number" &&
      !Number.isNaN(body.non_compete_miles)
        ? body.non_compete_miles
        : null,

    equipment_items_text:
      typeof body.equipment_items_text === "string" &&
      body.equipment_items_text.trim() !== ""
        ? body.equipment_items_text
        : null,
    closing_checklist_text:
      typeof body.closing_checklist_text === "string" &&
      body.closing_checklist_text.trim() !== ""
        ? body.closing_checklist_text
        : null,
  };

  console.log("[deals][PATCH] updates:", JSON.stringify(updates, null, 2));

  const { data, error } = await supabase
    .from("deals")
    .update(updates)
    .eq("id", dealId)
    .eq("user_id", user.id)
    .select(
      `
        id,
        user_id,
        business_name,
        purchase_price,
        down_payment,
        seller_financing,
        created_at,
        seller_name,
        seller_address,
        buyer_name,
        buyer_address,
        agreement_date,
        closing_date,
        included_assets_text,
        excluded_assets_text,
        deposit_amount,
        cash_at_closing,
        seller_financing_amount,
        seller_financing_clause,
        allocated_inventory,
        allocated_ffe,
        allocated_goodwill,
        allocation_total,
        state,
        non_compete_years,
        non_compete_miles,
        equipment_items_text,
        closing_checklist_text
      `
    )
    .single();

  if (error) {
    console.error("[deals][PATCH] supabase error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update deal." },
      { status: 500 }
    );
  }

  console.log("[deals][PATCH] saved row:", JSON.stringify(data, null, 2));

  return NextResponse.json({ deal: data });
}