import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import {
  TEMPLATE_REQUIREMENTS,
  TemplateKey,
  validateTemplateData,
} from "@/lib/template-requirements";

type RouteContext = {
  params: Promise<{
    dealId: string;
  }>;
};

const TEMPLATE_LABELS: Record<TemplateKey, string> = {
  asset_purchase_agreement: "Asset Purchase Agreement",
  bill_of_sale: "Bill of Sale",
  promissory_note: "Promissory Note",
  non_compete: "Non-Compete Agreement",
  irs_8594: "IRS Form 8594 Allocation Summary",
};

function valueOrDash(value: unknown) {
  if (value === null || value === undefined) return "-";
  if (typeof value === "string") return value.trim() === "" ? "-" : value;
  return String(value);
}

function formatCurrency(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(num);
}

function buildReviewSummary(deal: Record<string, unknown>) {
  return {
    business_name: valueOrDash(deal.business_name),
    seller_name: valueOrDash(deal.seller_name),
    buyer_name: valueOrDash(deal.buyer_name),
    seller_address: valueOrDash(deal.seller_address),
    buyer_address: valueOrDash(deal.buyer_address),
    agreement_date: valueOrDash(deal.agreement_date),
    closing_date: valueOrDash(deal.closing_date),
    state: valueOrDash(deal.state),
    purchase_price: formatCurrency(deal.purchase_price),
    deposit_amount: formatCurrency(deal.deposit_amount),
    cash_at_closing: formatCurrency(deal.cash_at_closing),
    seller_financing_amount: formatCurrency(deal.seller_financing_amount),
    non_compete_years: valueOrDash(deal.non_compete_years),
    non_compete_miles: valueOrDash(deal.non_compete_miles),
  };
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

  const { data: deal, error: dealError } = await supabase
    .from("deals")
    .select("*")
    .eq("id", dealId)
    .eq("user_id", user.id)
    .single();

  if (dealError || !deal) {
    return NextResponse.json({ error: "Deal not found." }, { status: 404 });
  }

  const readiness = (Object.keys(TEMPLATE_REQUIREMENTS) as TemplateKey[]).map(
    (templateKey) => {
      const result = validateTemplateData(templateKey, deal);
      return {
        template_key: templateKey,
        document_name: TEMPLATE_LABELS[templateKey],
        missing_fields: result.missing_fields,
        is_ready: result.is_ready,
      };
    }
  );

  return NextResponse.json({
    summary: buildReviewSummary(deal as Record<string, unknown>),
    readiness,
  });
}