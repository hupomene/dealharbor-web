import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import NewDealForm from "./new-deal-form";
import WorkspaceNav from "@/components/auth/workspace-nav";
import {
  canCreateMultipleDeals,
  getUserAccessProfile,
} from "@/lib/access-control";

const BROKER_PLAN_PAYMENT_LINK =
  "https://buy.stripe.com/5kQ14oaWu902ay18lTfUQ03";


function SingleDealLimitScreen() {
  return (
    <main className="min-h-screen bg-slate-50 px-8 py-10 text-slate-900">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">PactAnchor Workspace</p>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
              Single Deal Package Limit Reached
            </h1>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Your current plan is the Single Deal Package. This plan allows one
              business sale deal package. To create additional deals, upgrade to
              the Broker Launch Plan.
            </p>
          </div>

          <WorkspaceNav showNewDeal={false} />
        </div>

        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">
            Recommended Upgrade
          </p>

          <h2 className="mt-3 text-2xl font-bold text-slate-950">
            Broker Launch Plan
          </h2>

          <p className="mt-3 text-base leading-7 text-slate-700">
            Create multiple deal packages, manage repeated broker workflows, and
            continue generating synchronized APA, Bill of Sale, Promissory Note,
            Non-Compete, IRS allocation summary, and closing package documents.
          </p>

          <a
            href={BROKER_PLAN_PAYMENT_LINK}
            className="mt-6 inline-flex rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-slate-950 hover:bg-amber-400"
          >
            Upgrade to Broker Launch Plan
          </a>
        </div>
      </div>
    </main>
  );
}

type NewDealPageProps = {
  searchParams?: Promise<{
    mode?: string;
  }>;
};

export default async function NewDealPage({ searchParams }: NewDealPageProps) {
  const resolvedSearchParams = await searchParams;
  const isSandboxMode = resolvedSearchParams?.mode === "sandbox";

  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const nextPath = isSandboxMode
      ? "/deals/new?mode=sandbox"
      : "/deals/new";

    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  const accessProfile = await getUserAccessProfile({
    supabase,
    user,
  });

  const accessStatus = accessProfile.accessStatus;
  const isPaidOrAdmin = accessStatus === "paid" || accessStatus === "admin";
  const isFreeSandboxMode = !isPaidOrAdmin && isSandboxMode;

  if (accessStatus === "blocked") {
    redirect("/dashboard");
  }

  if (!isPaidOrAdmin && !isSandboxMode) {
    redirect("/dashboard");
  }

  if (isFreeSandboxMode) {
    const { data: existingSandboxDeal, error: sandboxLookupError } =
      await supabase
        .from("deals")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_sandbox", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (sandboxLookupError) {
      console.error(
        "[new deal] failed to check existing sandbox deal:",
        sandboxLookupError
      );
    }

    if (existingSandboxDeal?.id) {
      redirect(`/deals/${existingSandboxDeal.id}`);
    }
  }

  if (isPaidOrAdmin && !canCreateMultipleDeals(accessProfile.planType)) {
    const { count, error: countError } = await supabase
      .from("deals")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .or("is_sandbox.is.null,is_sandbox.eq.false");

    if (countError) {
      console.error("[new deal] failed to count paid deals:", countError);
    }

    if ((count ?? 0) >= 1) {
      return <SingleDealLimitScreen />;
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-8 py-10 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">PactAnchor Workspace</p>
            <h1 className="text-5xl font-semibold tracking-tight text-slate-900">
              {isFreeSandboxMode ? "Create Free Workspace" : "Create New Deal"}
            </h1>

            <p className="mt-4 text-lg text-slate-600">
              {isFreeSandboxMode
                ? "Start one free sandbox deal, enter transaction terms, and see Document Readiness before upgrading to download the final draft package."
                : "Start a new business sale deal and continue to the full contract drafting workspace."}
            </p>
          </div>


         <WorkspaceNav showNewDeal={false} />
        </div>

        {isFreeSandboxMode && (
          <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">
              Free Workspace
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              This sandbox workspace lets you enter deal information, review
              missing fields, and see Document Readiness. Final document export
              and download require a paid plan.
            </p>
          </div>
        )}

        <NewDealForm
          planType={accessProfile.planType}
          isSandboxMode={isFreeSandboxMode}
        />
      </div>
    </main>
  );
}