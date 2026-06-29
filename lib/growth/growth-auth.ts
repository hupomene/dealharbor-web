import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseAdminClient } from "@/lib/growth/growth-db";

type GrowthAdminAuthSuccess = {
  ok: true;
  userId: string;
  role: string;
  source: "internal_secret" | "bearer_token" | "cookie_session";
};

type GrowthAdminAuthFailure = {
  ok: false;
  response: NextResponse;
};

export type GrowthAdminAuthResult =
  | GrowthAdminAuthSuccess
  | GrowthAdminAuthFailure;

function getSupabasePublicConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!supabaseAnonKey) {
    throw new Error(
      "Missing browser Supabase key. Add NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  return { supabaseUrl, supabaseAnonKey };
}

function unauthorized(message = "Missing or invalid Growth Admin session") {
  return {
    ok: false as const,
    response: NextResponse.json({ error: message }, { status: 401 }),
  };
}

async function getGrowthAdminRole(userId: string) {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from("growth_admin_users")
    .select("user_id, role")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.role ?? null;
}

async function authenticateBearerToken(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.replace("Bearer ", "").trim();

  if (!token) {
    return null;
  }

  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return null;
  }

  const role = await getGrowthAdminRole(data.user.id);

  if (!role) {
    return unauthorized("This user is not registered as a Growth Admin.");
  }

  return {
    ok: true as const,
    userId: data.user.id,
    role,
    source: "bearer_token" as const,
  };
}

async function authenticateCookieSession() {
  const { supabaseUrl, supabaseAnonKey } = getSupabasePublicConfig();
  const cookieStore = await cookies();

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Ignore cookie write failures in read-only contexts.
        }
      },
    },
  });

  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  const role = await getGrowthAdminRole(data.user.id);

  if (!role) {
    return unauthorized("This user is not registered as a Growth Admin.");
  }

  return {
    ok: true as const,
    userId: data.user.id,
    role,
    source: "cookie_session" as const,
  };
}

export async function requireGrowthAdmin(
  request: Request,
): Promise<GrowthAdminAuthResult> {
  const internalSecret =
    process.env.GROWTH_INTERNAL_API_SECRET ?? process.env.CRON_SECRET;

  const requestSecret =
    request.headers.get("x-growth-internal-secret") ??
    request.headers.get("x-cron-secret");

  if (internalSecret && requestSecret === internalSecret) {
    return {
      ok: true,
      userId: "internal",
      role: "internal",
      source: "internal_secret",
    };
  }

  try {
    const bearerResult = await authenticateBearerToken(request);

    if (bearerResult) {
      return bearerResult;
    }

    const cookieResult = await authenticateCookieSession();

    if (cookieResult) {
      return cookieResult;
    }

    return unauthorized();
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Growth Admin authorization failed.";

    return {
      ok: false,
      response: NextResponse.json({ error: message }, { status: 500 }),
    };
  }
}