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

  return NextResponse.json({ readiness });
}