import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { getUserAccessProfile } from "@/lib/access-control";
import { buildApaPreview } from "@/lib/document-preview/apa-preview";

type RouteContext = {
  params: Promise<{ dealId: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  const { dealId } = await params;
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const requestedDocument = url.searchParams.get("document") ?? "apa";

  if (requestedDocument !== "apa") {
    return NextResponse.json(
      { error: "Only APA preview is currently available." },
      { status: 400 }
    );
  }

  const accessProfile = await getUserAccessProfile({ supabase, user });

  const { data: deal, error: dealError } = await supabase
    .from("deals")
    .select("*")
    .eq("id", dealId)
    .eq("user_id", user.id)
    .single();

  if (dealError || !deal) {
    return NextResponse.json({ error: "Deal not found." }, { status: 404 });
  }

  const accessStatus = accessProfile.accessStatus;
  const isPaidOrAdmin = accessStatus === "paid" || accessStatus === "admin";
  const isSandboxDeal = deal.is_sandbox === true;
  const isPaywallUnlocked = deal.paywall_unlocked === true;

  if (accessStatus === "blocked") {
    return NextResponse.json(
      { error: "Your account is blocked." },
      { status: 403 }
    );
  }

  if (!isPaidOrAdmin && !isSandboxDeal) {
    return NextResponse.json(
      { error: "Paid access required to preview this deal." },
      { status: 403 }
    );
  }

  const canExportDocuments =
    isPaidOrAdmin || isPaywallUnlocked || !isSandboxDeal;

  const preview = buildApaPreview(deal);

  return NextResponse.json({
    success: true,
    preview,
    access: {
      accessStatus,
      planType: accessProfile.planType,
      isSandboxDeal,
      canExportDocuments,
      previewMode: "redacted",
      exportLocked: !canExportDocuments,
    },
  });
}