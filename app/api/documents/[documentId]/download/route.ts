import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";

type RouteContext = {
  params: Promise<{ documentId: string }>;
};

const STORAGE_BUCKET = "documents";

function mimeType(fileType: string) {
  if (fileType === "pdf") return "application/pdf";
  if (fileType === "zip") return "application/zip";
  return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
}

export async function GET(_req: Request, { params }: RouteContext) {
  const { documentId } = await params;

  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // DB에서 문서 조회
  const { data: doc, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .eq("user_id", user.id)
    .single();

  if (error || !doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  // Storage에서 다운로드
  const { data, error: downloadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .download(doc.file_url);

  if (downloadError || !data) {
    return NextResponse.json(
      { error: "Download failed" },
      { status: 500 }
    );
  }

  return new NextResponse(data, {
    headers: {
      "Content-Type": mimeType(doc.file_type),
      "Content-Disposition": `attachment; filename="${doc.file_name}"`,
    },
  });
}