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

  const category = normalizeEnum(
    body.category,
    [
      "new_document",
      "clause_option",
      "workflow",
      "export",
      "collaboration",
      "attorney_review",
      "broker_tools",
      "pricing",
      "other",
    ],
    "other"
  );

  const priority = normalizeEnum(
    body.priority,
    ["low", "medium", "high"],
    "medium"
  );

  const insertPayload = {
    deal_id: normalizeText(body.deal_id),

    title,
    description,

    category,
    priority,

    requested_by_email: normalizeText(body.requested_by_email) ?? user.email ?? null,
    user_role: normalizeText(body.user_role),

    status: "submitted",
  };

  const { data, error } = await supabase
    .from("feature_requests")
    .insert(insertPayload)
    .select("*")
    .single();

  if (error) {
    console.error("Create feature request error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit feature request." },
      { status: 500 }
    );
  }

  return NextResponse.json({ featureRequest: data }, { status: 201 });
}