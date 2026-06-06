import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";

function normalizeText(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text === "" ? null : text;
}

function normalizeEnum(
  value: unknown,
  allowedValues: string[],
  fallback: string
): string {
  const text = normalizeText(value);
  if (!text) return fallback;
  return allowedValues.includes(text) ? text : fallback;
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body." },
      { status: 400 }
    );
  }

  const title = normalizeText(body.title);
  const description = normalizeText(body.description);

  if (!title || !description) {
    return NextResponse.json(
      { error: "Title and description are required." },
      { status: 400 }
    );
  }

  const issueType = normalizeEnum(
    body.issue_type,
    [
      "document_error",
      "missing_data",
      "wrong_calculation",
      "formatting_issue",
      "download_problem",
      "legal_language_concern",
      "other",
    ],
    "other"
  );

  const severity = normalizeEnum(
    body.severity,
    ["low", "medium", "high", "critical"],
    "medium"
  );

  const insertPayload = {
    deal_id: normalizeText(body.deal_id),
    document_type: normalizeText(body.document_type),

    issue_type: issueType,
    severity,

    title,
    description,

    user_email: normalizeText(body.user_email) ?? user.email ?? null,
    page_url: normalizeText(body.page_url),

    status: "open",
  };

  const { data, error } = await supabase
    .from("issue_reports")
    .insert(insertPayload)
    .select("*")
    .single();

  if (error) {
    console.error("Create issue report error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit issue report." },
      { status: 500 }
    );
  }

  return NextResponse.json({ issueReport: data }, { status: 201 });
}