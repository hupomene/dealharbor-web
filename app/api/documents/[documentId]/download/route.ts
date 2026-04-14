import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";

type RouteContext = {
  params: Promise<{
    documentId: string;
  }>;
};

function getContentType(fileType: string): string {
  switch (fileType) {
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "pdf":
      return "application/pdf";
    case "zip":
      return "application/zip";
    default:
      return "application/octet-stream";
  }
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { documentId } = await params;
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: document, error } = await supabase
    .from("documents")
    .select("id, user_id, file_name, file_type, file_url")
    .eq("id", documentId)
    .eq("user_id", user.id)
    .single();

  if (error || !document) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  const absolutePath = path.resolve(process.cwd(), document.file_url);
  const projectRoot = path.resolve(process.cwd());

  if (!absolutePath.startsWith(projectRoot)) {
    return NextResponse.json({ error: "Invalid file path." }, { status: 400 });
  }

  try {
    const fileBuffer = await fs.readFile(absolutePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": getContentType(document.file_type),
        "Content-Disposition": `attachment; filename="${encodeURIComponent(
          document.file_name
        )}"`,
        "Cache-Control": "private, no-store, max-age=0",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Generated file not found on disk." },
      { status: 404 }
    );
  }
}