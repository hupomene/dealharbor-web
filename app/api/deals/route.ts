import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import type { CreateDocumentInput, DocumentRecord } from "@/types/persistence";

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

    return NextResponse.json({
      documents: (data ?? []) as DocumentRecord[],
    });
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

    if (
      !body.deal_id ||
      !body.file_name ||
      !body.file_type ||
      !body.file_url
    ) {
      return NextResponse.json(
        { error: "Missing required document fields." },
        { status: 400 }
      );
    }

    const insertPayload: CreateDocumentInput = {
      deal_id: body.deal_id,
      user_id: user.id,
      batch_id: body.batch_id ?? null,
      file_name: body.file_name,
      file_type: body.file_type,
      document_type: body.document_type ?? body.file_type,
      file_url: body.file_url,
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

    return NextResponse.json(
      { document: data as DocumentRecord },
      { status: 201 }
    );
  } catch (error) {
    console.error("[documents][POST] unexpected error:", error);
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}