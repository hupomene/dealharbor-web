import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PlanType = "single_deal" | "broker_launch";

function getStripeClient() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY.");
  }

  return new Stripe(stripeSecretKey);
}

function normalizeEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() ?? null;
}

function getPlanTypeFromSession(session: Stripe.Checkout.Session): PlanType | null {
  const metadataPlanType = session.metadata?.plan_type;

  if (metadataPlanType === "single_deal") {
    return "single_deal";
  }

  if (metadataPlanType === "broker_launch") {
    return "broker_launch";
  }

  const amountTotal = session.amount_total ?? 0;

  if (amountTotal === 4900) {
    return "single_deal";
  }

  if (amountTotal === 14900) {
    return "broker_launch";
  }

  return null;
}

function getAccessExpiresAtForSingleDeal() {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);
  return expiresAt.toISOString();
}

async function unlockSingleDealForUser(userId: string) {
  const supabase = createSupabaseAdminClient();

  const accessExpiresAt = getAccessExpiresAtForSingleDeal();

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      access_status: "paid",
      plan_type: "single_deal",
    })
    .eq("id", userId);

  if (profileError) {
    throw new Error(`Profile update failed: ${profileError.message}`);
  }

  const { data: sandboxDeal, error: sandboxLookupError } = await supabase
    .from("deals")
    .select("id")
    .eq("user_id", userId)
    .eq("is_sandbox", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (sandboxLookupError) {
    throw new Error(`Sandbox lookup failed: ${sandboxLookupError.message}`);
  }

  if (sandboxDeal?.id) {
    const { error: dealError } = await supabase
      .from("deals")
      .update({
        paywall_unlocked: true,
        access_expires_at: accessExpiresAt,
      })
      .eq("id", sandboxDeal.id)
      .eq("user_id", userId);

    if (dealError) {
      throw new Error(`Sandbox deal unlock failed: ${dealError.message}`);
    }
  }
}

async function unlockBrokerLaunchForUser(userId: string) {
  const supabase = createSupabaseAdminClient();

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      access_status: "paid",
      plan_type: "broker_launch",
    })
    .eq("id", userId);

  if (profileError) {
    throw new Error(`Profile update failed: ${profileError.message}`);
  }

  const { error: dealError } = await supabase
    .from("deals")
    .update({
      paywall_unlocked: true,
    })
    .eq("user_id", userId)
    .eq("is_sandbox", true);

  if (dealError) {
    throw new Error(`Sandbox deal unlock failed: ${dealError.message}`);
  }
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  const supabase = createSupabaseAdminClient();

  const customerEmail = normalizeEmail(
    session.customer_details?.email ?? session.customer_email
  );

  if (!customerEmail) {
    throw new Error("Checkout session completed without customer email.");
  }

  const planType = getPlanTypeFromSession(session);

  if (!planType) {
    throw new Error(
      `Unable to determine plan type for checkout session ${session.id}.`
    );
  }

  const { data: profile, error: profileLookupError } = await supabase
    .from("profiles")
    .select("id, email")
    .ilike("email", customerEmail)
    .maybeSingle();

  if (profileLookupError) {
    throw new Error(`Profile lookup failed: ${profileLookupError.message}`);
  }

  if (!profile?.id) {
    throw new Error(`No PactAnchor profile found for ${customerEmail}.`);
  }

  if (planType === "single_deal") {
    await unlockSingleDealForUser(profile.id);
    return;
  }

  if (planType === "broker_launch") {
    await unlockBrokerLaunchForUser(profile.id);
    return;
  }
}

export async function POST(request: Request) {
  const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeWebhookSecret) {
    return NextResponse.json(
      { error: "Missing STRIPE_WEBHOOK_SECRET." },
      { status: 500 }
    );
  }

  let stripe: Stripe;

  try {
    stripe = getStripeClient();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Missing Stripe configuration.";

    return NextResponse.json({ error: message }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header." },
      { status: 400 }
    );
  }

  const rawBody = await request.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      stripeWebhookSecret
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Webhook signature failed.";

    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    );
  }

  try {
    if (event.type === "checkout.session.completed") {
      await handleCheckoutSessionCompleted(
        event.data.object as Stripe.Checkout.Session
      );
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Webhook handler failed.";

    console.error("Stripe webhook error:", message);

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}