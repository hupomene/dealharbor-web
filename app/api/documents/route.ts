import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import type { CreateDocumentInput, DocumentRecord } from "@/types/persistence";

type DatabaseDocumentRow = {
  id: string;
  deal_id: string;
  user_id: string;
  batch_id?: string | null;
  document_type?: string | null;
  file_name: string;
  mime_type?: string | null;
  storage_path?: string | null;
  file_url?: string | null;
  file_type?: string | null;
  status?: string | null;
  generated_at?: string | null;
  meta?: Record<string, unknown> | null;
  created_at: string | null;
  updated_at?: string | null;
};

function inferFileType(row: DatabaseDocumentRow): "docx" | "pdf" | "zip" {
  if (row.file_type === "docx" || row.file_type === "pdf" || row.file_type === "zip") {
    return row.file_type;
  }

  const lowerName = row.file_name.toLowerCase();

  if (lowerName.endsWith(".pdf")) return "pdf";
  if (lowerName.endsWith(".zip")) return "zip";
  return "docx";
}

function mapDocumentRow(row: DatabaseDocumentRow): DocumentRecord {
  return {
    id: row.id,
    deal_id: row.deal_id,
    user_id: row.user_id,
    batch_id: row.batch_id ?? null,
    file_name: row.file_name,
    file_type: inferFileType(row),
    document_type: row.document_type ?? null,
    file_url: row.file_url ?? row.storage_path ?? "",
    created_at: row.created_at,
  };
}

export async function GET(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dealId = searchParams.get("dealId");

    let query = supabase
      .from("documents")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (dealId) {
      query = query.eq("deal_id", dealId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to load documents." },
        { status: 500 }
      );
    }

    const documents = ((data ?? []) as DatabaseDocumentRow[]).map(mapDocumentRow);

    return NextResponse.json({ documents }, { status: 200 });
  } catch (error) {
    console.error("[documents][GET] unexpected error:", error);
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as Partial<CreateDocumentInput>;

    if (!body.deal_id || !body.file_name || !body.file_type || !body.file_url) {
      return NextResponse.json(
        { error: "Missing required document fields." },
        { status: 400 }
      );
    }

    const insertPayload = {
      deal_id: body.deal_id,
      user_id: user.id,
      batch_id: body.batch_id ?? null,
      document_type: body.document_type ?? body.file_type,
      file_name: body.file_name,
      file_type: body.file_type,
      file_url: body.file_url,
      storage_path: body.file_url,
      mime_type:
        body.file_type === "pdf"
          ? "application/pdf"
          : body.file_type === "zip"
          ? "application/zip"
          : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      status: "generated",
      generated_at: new Date().toISOString(),
      meta: {},
    };

    const { data, error } = await supabase
      .from("documents")
      .insert(insertPayload)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to create document record." },
        { status: 500 }
      );
    }

    const document = mapDocumentRow(data as DatabaseDocumentRow);

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    console.error("[documents][POST] unexpected error:", error);
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}