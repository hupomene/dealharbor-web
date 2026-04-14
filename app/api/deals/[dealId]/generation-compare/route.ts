import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";

type RouteContext = {
  params: Promise<{
    dealId: string;
  }>;
};

type CompareField = {
  key: string;
  label: string;
};

const COMPARE_FIELDS: CompareField[] = [
  { key: "business_name", label: "Business Name" },
  { key: "seller_name", label: "Seller" },
  { key: "buyer_name", label: "Buyer" },
  { key: "agreement_date", label: "Agreement Date" },
  { key: "closing_date", label: "Closing Date" },
  { key: "purchase_price", label: "Purchase Price" },
  { key: "deposit_amount", label: "Deposit Amount" },
  { key: "cash_at_closing", label: "Cash at Closing" },
  { key: "seller_financing_amount", label: "Seller Financing" },
  { key: "state", label: "State" },
  { key: "non_compete_years", label: "Non-Compete Years" },
  { key: "non_compete_miles", label: "Non-Compete Miles" },
];

function normalizeValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

export async function GET(request: Request, { params }: RouteContext) {
  const { dealId } = await params;
  const { searchParams } = new URL(request.url);
  const olderBatchId = searchParams.get("olderBatchId");
  const newerBatchId = searchParams.get("newerBatchId");

  if (!olderBatchId || !newerBatchId) {
    return NextResponse.json(
      { error: "olderBatchId and newerBatchId are required." },
      { status: 400 }
    );
  }

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
    .select("id")
    .eq("id", dealId)
    .eq("user_id", user.id)
    .single();

  if (dealError || !deal) {
    return NextResponse.json({ error: "Deal not found." }, { status: 404 });
  }

  const { data: batches, error: batchesError } = await supabase
    .from("generation_batches")
    .select(
      `
        id,
        deal_id,
        user_id,
        batch_name,
        created_at,
        review_summary
      `
    )
    .in("id", [olderBatchId, newerBatchId])
    .eq("deal_id", dealId)
    .eq("user_id", user.id);

  if (batchesError) {
    return NextResponse.json(
      { error: batchesError.message || "Failed to load batches." },
      { status: 500 }
    );
  }

  const olderBatch = (batches ?? []).find((b) => b.id === olderBatchId);
  const newerBatch = (batches ?? []).find((b) => b.id === newerBatchId);

  if (!olderBatch || !newerBatch) {
    return NextResponse.json(
      { error: "One or both batches were not found." },
      { status: 404 }
    );
  }

  const olderSummary = (olderBatch.review_summary ?? {}) as Record<string, unknown>;
  const newerSummary = (newerBatch.review_summary ?? {}) as Record<string, unknown>;

  const changes = COMPARE_FIELDS.map((field) => {
    const olderValue = normalizeValue(olderSummary[field.key]);
    const newerValue = normalizeValue(newerSummary[field.key]);

    return {
      key: field.key,
      label: field.label,
      older_value: olderValue,
      newer_value: newerValue,
      changed: olderValue !== newerValue,
    };
  });

  return NextResponse.json({
    older_batch: {
      id: olderBatch.id,
      batch_name: olderBatch.batch_name,
      created_at: olderBatch.created_at,
    },
    newer_batch: {
      id: newerBatch.id,
      batch_name: newerBatch.batch_name,
      created_at: newerBatch.created_at,
    },
    changes,
  });
}