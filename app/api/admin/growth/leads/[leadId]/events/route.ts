import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/growth/growth-db";
import { requireGrowthAdmin } from "@/lib/growth/growth-auth";

export async function GET(
  request: Request,
  context: { params: Promise<{ leadId: string }> }
) {
  const auth = await requireGrowthAdmin(request);

  if (!auth.ok) {
    return auth.response;
  }

  const { leadId } = await context.params;

  if (!leadId) {
    return NextResponse.json({ error: "Missing lead id" }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from("growth_outreach_events")
    .select(
      `
      id,
      lead_id,
      event_type,
      channel,
      event_notes,
      metadata,
      created_at
      `
    )
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    events: data ?? [],
  });
}