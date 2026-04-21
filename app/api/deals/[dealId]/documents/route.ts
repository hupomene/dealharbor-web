import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";

type RouteContext = {
  params: Promise<{ dealId: string }>;
};

const STORAGE_BUCKET = "documents";

type EngineFile = {
  file_name: string;
  file_type: "docx" | "pdf" | "zip";
  content_base64: string;
};

type EngineResponse = {
  files: EngineFile[];
};

function mimeTypeFor(fileType: "docx" | "pdf" | "zip") {
  if (fileType === "pdf") return "application/pdf";
  if (fileType === "zip") return "application/zip";
  return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
}

function inferDocumentTypeFromTemplate(templateKey: string) {
  switch (templateKey) {
    case "asset_purchase_agreement":
      return "asset_purchase_agreement";
    case "bill_of_sale":
      return "bill_of_sale";
    case "promissory_note":
      return "promissory_note";
    case "non_compete":
      return "non_compete";
    default:
      return templateKey;
  }
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

  return NextResponse.json({ documents: data ?? [] });
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

  const templates: string[] = Array.isArray(body.templates)
    ? body.templates
    : ["asset_purchase_agreement"];

  const requestedOutputFormat = String(
    body.outputFormat ?? body.output_format ?? "docx"
  ).toLowerCase() as "docx" | "pdf" | "zip";

  const { data: deal, error: dealError } = await supabase
    .from("deals")
    .select("*")
    .eq("id", dealId)
    .eq("user_id", user.id)
    .single();

  if (dealError || !deal) {
    return NextResponse.json({ error: "Deal not found." }, { status: 404 });
  }

  const documentEngineUrl = process.env.DOCUMENT_ENGINE_URL;
  if (!documentEngineUrl) {
    return NextResponse.json(
      { error: "DOCUMENT_ENGINE_URL is not configured." },
      { status: 500 }
    );
  }

  const payloads = templates.map((templateKey) => ({
    templateKey,
    outputFilename: templateKey,
    data: deal,
  }));

  let engineResponse: Response;
  try {
    engineResponse = await fetch(`${documentEngineUrl}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        payloads,
        output_format: requestedOutputFormat,
      }),
      cache: "no-store",
    });
  } catch (error) {
    console.error("[deal-documents][POST] engine fetch error:", error);
    return NextResponse.json(
      { error: "Failed to connect to document engine." },
      { status: 500 }
    );
  }

  if (!engineResponse.ok) {
    const contentType = engineResponse.headers.get("content-type") || "";
    let detail = "Document engine request failed.";

    try {
      if (contentType.includes("application/json")) {
        const json = await engineResponse.json();
        detail = json?.detail || json?.error || detail;
      } else {
        const text = await engineResponse.text();
        detail = `Document engine returned a non-JSON response. Preview: ${text.slice(
          0,
          200
        )}`;
      }
    } catch {
      // ignore
    }

    return NextResponse.json({ error: detail }, { status: 500 });
  }

  let engineData: EngineResponse;
  try {
    engineData = (await engineResponse.json()) as EngineResponse;
  } catch (error) {
    console.error("[deal-documents][POST] engine JSON parse error:", error);
    return NextResponse.json(
      { error: "Document engine returned invalid JSON." },
      { status: 500 }
    );
  }

  const files = Array.isArray(engineData.files) ? engineData.files : [];
  if (files.length === 0) {
    return NextResponse.json(
      { error: "Document engine returned no files." },
      { status: 500 }
    );
  }

  const insertedDocs: any[] = [];

  for (let index = 0; index < files.length; index += 1) {
    const artifact = files[index];
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

    const templateKey = templates[Math.min(index, templates.length - 1)];
    const documentType = inferDocumentTypeFromTemplate(templateKey);

    const { data: inserted, error: insertError } = await supabase
      .from("documents")
      .insert({
        user_id: user.id,
        deal_id: dealId,
        document_type: documentType,
        file_name: artifact.file_name,
        file_type: artifact.file_type,
        file_url: storagePath,
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