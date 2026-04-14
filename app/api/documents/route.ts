import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import type { CreateDocumentInput, DocumentRecord } from "@/types/persistence";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const dealId = url.searchParams.get("dealId");

    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    let query = supabase
      .from("documents")
      .select(
        "id,deal_id,user_id,document_type,file_name,mime_type,storage_path,status,generated_at,meta,created_at,updated_at"
      )
      .order("created_at", { ascending: false });

    if (dealId) {
      query = query.eq("deal_id", dealId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { documents: (data ?? []) as DocumentRecord[] },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unexpected server error",
      },
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
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = (await request.json()) as CreateDocumentInput;

    if (!body.deal_id || !body.document_type || !body.file_name) {
      return NextResponse.json(
        { error: "deal_id, document_type, and file_name are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("documents")
      .insert({
        deal_id: body.deal_id,
        user_id: user.id,
        document_type: body.document_type,
        file_name: body.file_name,
        mime_type:
          body.mime_type ??
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        storage_path: body.storage_path ?? null,
        status: body.status ?? "generated",
        generated_at: body.generated_at ?? new Date().toISOString(),
        meta: body.meta ?? {},
      })
      .select(
        "id,deal_id,user_id,document_type,file_name,mime_type,storage_path,status,generated_at,meta,created_at,updated_at"
      )
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { document: data as DocumentRecord },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unexpected server error",
      },
      { status: 500 }
    );
  }
}