import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";

function normalizeText(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text === "" ? null : text;
}

function normalizeRating(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;

  const rating = Number(value);

  if (!Number.isInteger(rating)) return null;
  if (rating < 1 || rating > 5) return null;

  return rating;
}

function normalizeBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }
  return false;
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

  const hasAnyRating =
    normalizeRating(body.time_saving_rating) !== null ||
    normalizeRating(body.document_quality_rating) !== null ||
    normalizeRating(body.ease_of_use_rating) !== null ||
    normalizeRating(body.synchronization_value_rating) !== null ||
    normalizeRating(body.likelihood_to_use_again) !== null ||
    normalizeRating(body.likelihood_to_recommend) !== null;

  const hasAnyComment =
    normalizeText(body.most_useful) !== null ||
    normalizeText(body.most_confusing) !== null ||
    normalizeText(body.improvement_suggestion) !== null;

  if (!hasAnyRating && !hasAnyComment) {
    return NextResponse.json(
      {
        error:
          "Please provide at least one rating or one written feedback response.",
      },
      { status: 400 }
    );
  }

  const insertPayload = {
    deal_id: normalizeText(body.deal_id),

    user_role: normalizeText(body.user_role),
    user_email: normalizeText(body.user_email) ?? user.email ?? null,

    time_saving_rating: normalizeRating(body.time_saving_rating),
    document_quality_rating: normalizeRating(body.document_quality_rating),
    ease_of_use_rating: normalizeRating(body.ease_of_use_rating),
    synchronization_value_rating: normalizeRating(
      body.synchronization_value_rating
    ),
    likelihood_to_use_again: normalizeRating(body.likelihood_to_use_again),
    likelihood_to_recommend: normalizeRating(body.likelihood_to_recommend),

    most_useful: normalizeText(body.most_useful),
    most_confusing: normalizeText(body.most_confusing),
    improvement_suggestion: normalizeText(body.improvement_suggestion),
    open_to_feedback_call: normalizeBoolean(body.open_to_feedback_call),

    status: "submitted",
  };

  const { data, error } = await supabase
    .from("product_feedback")
    .insert(insertPayload)
    .select("*")
    .single();

  if (error) {
    console.error("Create product feedback error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit product feedback." },
      { status: 500 }
    );
  }

  return NextResponse.json({ productFeedback: data }, { status: 201 });
}