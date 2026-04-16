import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { runDocumentGenerator } from "@/lib/document-engine";

type RouteContext = {
  params: Promise<{ dealId: string }>;
};

const STORAGE_BUCKET = "documents";

function mimeTypeFor(fileType: "docx" | "pdf" | "zip") {
  if (fileType === "pdf") return "application/pdf";
  if (fileType === "zip") return "application/zip";
  return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
}

function inferFileType(
  fileName: string,
  rawType?: string | null
): "docx" | "pdf" | "zip" {
  if (rawType === "docx" || rawType === "pdf" || rawType === "zip") {
    return rawType;
  }

  const lower = fileName.toLowerCase();
  if (lower.endsWith(".pdf")) return "pdf";
  if (lower.endsWith(".zip")) return "zip";
  return "docx";
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
    console.error("[deal-documents][GET] deal lookup error:", dealError);
    return NextResponse.json({ error: "Deal not found." }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("deal_id", dealId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[deal-documents][GET] documents query error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load documents." },
      { status: 500 }
    );
  }

  const documents = (data ?? []).map((row: any) => ({
    id: row.id,
    deal_id: row.deal_id,
    user_id: row.user_id,
    batch_id: row.batch_id ?? null,
    file_name: row.file_name,
    file_type: inferFileType(
      row.file_name,
      row.file_type ?? row.document_type ?? null
    ),
    document_type: row.document_type ?? null,
    file_url: row.file_url ?? "",
    created_at: row.created_at ?? null,
  }));

  return NextResponse.json({ documents });
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

  const body = await request.json();
  const templates = Array.isArray(body.templates)
    ? body.templates
    : ["asset_purchase_agreement"];
  const outputFormat = body.outputFormat ?? "docx";

  const { data: deal, error: dealError } = await supabase
    .from("deals")
    .select("*")
    .eq("id", dealId)
    .eq("user_id", user.id)
    .single();

  if (dealError || !deal) {
    return NextResponse.json({ error: "Deal not found." }, { status: 404 });
  }

  let artifacts;
  try {
    artifacts = await runDocumentGenerator({
      dealId,
      dealData: deal,
      templates,
      outputFormat,
    });
  } catch (error) {
    console.error("[deal-documents][POST] generator error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate contract package.",
      },
      { status: 500 }
    );
  }

  const insertedDocs = [];

  for (const artifact of artifacts) {
    const buffer = Buffer.from(artifact.content_base64, "base64");
    const storagePath = `${user.id}/${dealId}/${randomUUID()}-${artifact.file_name}`;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, buffer, {
        contentType: mimeTypeFor(artifact.file_type),
        upsert: false,
      });

    if (uploadError) {
      console.error("[deal-documents][POST] storage upload error:", uploadError);
      return NextResponse.json(
        { error: `Storage upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    const { data: inserted, error: insertError } = await supabase
      .from("documents")
      .insert({
        user_id: user.id,
        deal_id: dealId,
        file_name: artifact.file_name,
        file_type: artifact.file_type,
        file_url: storagePath,
        document_type: artifact.file_type,
      })
      .select("*")
      .single();

    if (insertError) {
      console.error("[deal-documents][POST] document insert error:", insertError);
      return NextResponse.json(
        { error: `Document insert failed: ${insertError.message}` },
        { status: 500 }
      );
    }

    insertedDocs.push(inserted);
  }

  return NextResponse.json({
    success: true,
    documents: insertedDocs,
  });
}