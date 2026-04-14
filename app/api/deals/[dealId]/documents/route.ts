import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { runDocumentGenerator } from "@/lib/document-engine";

type RouteContext = {
  params: Promise<{
    dealId: string;
  }>;
};

function buildReviewSummary(deal: Record<string, unknown>) {
  return {
    business_name: deal.business_name ?? null,
    seller_name: deal.seller_name ?? null,
    buyer_name: deal.buyer_name ?? null,
    agreement_date: deal.agreement_date ?? null,
    closing_date: deal.closing_date ?? null,
    purchase_price: deal.purchase_price ?? null,
    deposit_amount: deal.deposit_amount ?? null,
    cash_at_closing: deal.cash_at_closing ?? null,
    seller_financing_amount: deal.seller_financing_amount ?? null,
    state: deal.state ?? null,
    non_compete_years: deal.non_compete_years ?? null,
    non_compete_miles: deal.non_compete_miles ?? null,
  };
}

function normalizeTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
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
    .select("id")
    .eq("id", dealId)
    .eq("user_id", user.id)
    .single();

  if (dealError || !deal) {
    return NextResponse.json({ error: "Deal not found." }, { status: 404 });
  }

  const { data: documents, error: documentsError } = await supabase
    .from("documents")
    .select("id, deal_id, file_name, file_type, file_url, created_at, batch_id")
    .eq("deal_id", dealId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (documentsError) {
    console.error("[documents][GET] documentsError:", documentsError);
    return NextResponse.json(
      { error: documentsError.message || "Failed to load documents." },
      { status: 500 }
    );
  }

  return NextResponse.json({ documents: documents ?? [] });
}

export async function POST(request: Request, { params }: RouteContext) {
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
    console.error("[documents][POST] dealError:", dealError);
    return NextResponse.json({ error: "Deal not found." }, { status: 404 });
  }

  let body: any = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const templates = Array.isArray(body.templates)
    ? body.templates.filter((value: unknown) => typeof value === "string")
    : ["asset_purchase_agreement"];

  const outputFormat =
    body.output_format === "pdf" || body.output_format === "zip"
      ? body.output_format
      : "docx";

  const batchName =
    typeof body.batch_name === "string" && body.batch_name.trim() !== ""
      ? body.batch_name.trim()
      : null;

  const batchNotes =
    typeof body.batch_notes === "string" && body.batch_notes.trim() !== ""
      ? body.batch_notes.trim()
      : null;

  const batchTags = normalizeTags(body.batch_tags);

  let batchId: string | null = null;

  try {
    const { data: batch, error: batchError } = await supabase
      .from("generation_batches")
      .insert({
        deal_id: dealId,
        user_id: user.id,
        templates,
        output_format: outputFormat,
        review_summary: buildReviewSummary(deal as Record<string, unknown>),
        batch_name: batchName,
        batch_notes: batchNotes,
        batch_tags: batchTags,
      })
      .select("id")
      .single();

    if (batchError) {
      console.error("[documents][POST] batchError:", batchError);
      return NextResponse.json(
        {
          error: batchError.message || "Failed to create generation batch.",
        },
        { status: 500 }
      );
    }

    batchId = batch.id;

    const artifacts = await runDocumentGenerator({
      dealId,
      userId: user.id,
      dealData: deal,
      templates,
      outputFormat,
    });

    const rows = artifacts.map((artifact) => ({
      deal_id: dealId,
      user_id: user.id,
      batch_id: batchId,
      file_name: artifact.file_name,
      file_type: artifact.file_type,
      document_type: artifact.file_type,
      file_url: artifact.file_url,
    }));

    const { data: insertedDocuments, error: insertError } = await supabase
      .from("documents")
      .insert(rows)
      .select("id, deal_id, file_name, file_type, file_url, created_at, batch_id");

    if (insertError) {
      console.error("[documents][POST] insertError:", insertError);
      return NextResponse.json(
        {
          error: insertError.message || "Failed to save document metadata.",
          details: insertError,
        },
        { status: 500 }
      );
    }

    const sortedDocuments = [...(insertedDocuments ?? [])].sort((a, b) => {
      const aTime = new Date(a.created_at ?? 0).getTime();
      const bTime = new Date(b.created_at ?? 0).getTime();
      return bTime - aTime;
    });

    return NextResponse.json(
      {
        success: true,
        batch_id: batchId,
        documents: sortedDocuments,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[documents][POST] unhandled error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Document generation failed.",
      },
      { status: 500 }
    );
  }
}