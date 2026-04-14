import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";

type RouteContext = {
  params: Promise<{
    dealId: string;
  }>;
};

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

  const { data: batches, error: batchesError } = await supabase
    .from("generation_batches")
    .select(
      `
        id,
        deal_id,
        user_id,
        templates,
        output_format,
        review_summary,
        batch_name,
        batch_notes,
        batch_tags,
        created_at
      `
    )
    .eq("deal_id", dealId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (batchesError) {
    console.error("[generation-history][GET] batchesError:", batchesError);
    return NextResponse.json(
      { error: batchesError.message || "Failed to load generation history." },
      { status: 500 }
    );
  }

  const batchIds = (batches ?? []).map((batch) => batch.id);

  let documentsByBatch: Record<string, any[]> = {};

  if (batchIds.length > 0) {
    const { data: docs, error: docsError } = await supabase
      .from("documents")
      .select(
        `
          id,
          batch_id,
          deal_id,
          file_name,
          file_type,
          file_url,
          created_at
        `
      )
      .in("batch_id", batchIds)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (docsError) {
      console.error("[generation-history][GET] docsError:", docsError);
      return NextResponse.json(
        { error: docsError.message || "Failed to load history documents." },
        { status: 500 }
      );
    }

    documentsByBatch = (docs ?? []).reduce<Record<string, any[]>>((acc, doc) => {
      const key = doc.batch_id ?? "unbatched";
      if (!acc[key]) acc[key] = [];
      acc[key].push(doc);
      return acc;
    }, {});
  }

  const history = (batches ?? []).map((batch) => ({
    ...batch,
    documents: documentsByBatch[batch.id] ?? [],
  }));

  return NextResponse.json({ history });
}