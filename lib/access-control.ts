import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

type SupabaseLikeClient = {
  from: (table: string) => any;
};

export type AccessStatus = "free" | "paid" | "admin" | "blocked";

export type PlanType =
  | "single_deal"
  | "broker_launch"
  | "attorney_workflow"
  | "admin"
  | null;

export type UserAccessProfile = {
  accessStatus: AccessStatus;
  planType: PlanType;
  planLabel: string;
  isAdmin: boolean;
  isPaid: boolean;
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

export function getPlanLabel(planType: PlanType) {
  switch (planType) {
    case "single_deal":
      return "Single Deal Package";
    case "broker_launch":
      return "Broker Launch Plan";
    case "attorney_workflow":
      return "Attorney Workflow Plan";
    case "admin":
      return "Admin Access";
    default:
      return "Free / Pending Access";
  }
}

export async function getUserAccessProfile({
  supabase,
  user,
}: {
  supabase: SupabaseLikeClient;
  user: User;
}): Promise<UserAccessProfile> {
  if (isAdminEmail(user.email)) {
    return {
      accessStatus: "admin",
      planType: "admin",
      planLabel: "Admin Access",
      isAdmin: true,
      isPaid: true,
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("access_status, plan_type")
    .eq("id", user.id)
    .maybeSingle();

  const accessStatus = (profile?.access_status ?? "free") as AccessStatus;
  const isAdmin = accessStatus === "admin";

  const planType = (
    isAdmin ? "admin" : profile?.plan_type ?? null
  ) as PlanType;

  return {
    accessStatus,
    planType,
    planLabel: getPlanLabel(planType),
    isAdmin,
    isPaid: accessStatus === "paid" || isAdmin,
  };
}

export async function getUserAccessStatus({
  supabase,
  user,
}: {
  supabase: SupabaseLikeClient;
  user: User;
}) {
  const accessProfile = await getUserAccessProfile({ supabase, user });
  return accessProfile.accessStatus;
}

export async function requirePaidAccess({
  supabase,
  user,
}: {
  supabase: SupabaseLikeClient;
  user: User;
}) {
  const accessProfile = await getUserAccessProfile({ supabase, user });

  if (!accessProfile.isPaid) {
    redirect("/dashboard");
  }

  return accessProfile.accessStatus;
}

export async function requirePaidAccessProfile({
  supabase,
  user,
}: {
  supabase: SupabaseLikeClient;
  user: User;
}) {
  const accessProfile = await getUserAccessProfile({ supabase, user });

  if (!accessProfile.isPaid) {
    redirect("/dashboard");
  }

  return accessProfile;
}

export function isSingleDealPlan(planType: PlanType) {
  return planType === "single_deal";
}

export function isBrokerPlan(planType: PlanType) {
  return planType === "broker_launch";
}

export function canCreateMultipleDeals(planType: PlanType) {
  return (
    planType === "broker_launch" ||
    planType === "attorney_workflow" ||
    planType === "admin"
  );
}

export function canEditDealIdentityFields(planType: PlanType) {
  return (
    planType === "broker_launch" ||
    planType === "attorney_workflow" ||
    planType === "admin"
  );
}