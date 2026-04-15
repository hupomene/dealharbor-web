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

export async function POST(request: Request, { params }: RouteContext) {
  const { dealId } = await params;

  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const templates = body.templates ?? ["asset_purchase_agreement"];
  const outputFormat = body.outputFormat ?? "docx";

  // deal 가져오기
  const { data: deal, error: dealError } = await supabase
    .from("deals")
    .select("*")
    .eq("id", dealId)
    .eq("user_id", user.id)
    .single();

  if (dealError || !deal) {
    return NextResponse.json({ error: "Deal not found" }, { status: 404 });
  }

  // document-engine 호출
  const artifacts = await runDocumentGenerator({
    dealId,
    dealData: deal,
    templates,
    outputFormat,
  });

  const results = [];

  for (const artifact of artifacts) {
    const buffer = Buffer.from(artifact.content_base64, "base64");

    const storagePath = `${user.id}/${dealId}/${randomUUID()}-${artifact.file_name}`;

    // ✅ Supabase Storage 업로드
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, buffer, {
        contentType: mimeTypeFor(artifact.file_type),
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    // DB 저장
    const { data: doc, error: insertError } = await supabase
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
      throw new Error(insertError.message);
    }

    results.push(doc);
  }

  return NextResponse.json({
    success: true,
    documents: results,
  });
}