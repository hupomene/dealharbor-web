import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

type SupabaseLikeClient = {
  from: (table: string) => any;
};

export function getAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined) {
  const adminEmails = getAdminEmails();

  return (
    adminEmails.length > 0 &&
    adminEmails.includes((email ?? "").toLowerCase())
  );
}

export async function getUserAccessStatus({
  supabase,
  user,
}: {
  supabase: SupabaseLikeClient;
  user: User;
}) {
  if (isAdminEmail(user.email)) {
    return "admin";
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("access_status, plan_type")
    .eq("id", user.id)
    .maybeSingle();

  return profile?.access_status ?? "free";
}

export async function requirePaidAccess({
  supabase,
  user,
}: {
  supabase: SupabaseLikeClient;
  user: User;
}) {
  const accessStatus = await getUserAccessStatus({ supabase, user });

  if (accessStatus !== "paid" && accessStatus !== "admin") {
    redirect("/dashboard");
  }

  return accessStatus;
}