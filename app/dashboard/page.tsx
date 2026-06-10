import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import type { DealRecord } from "@/types/persistence";
import LogoutButton from "@/components/auth/logout-button";

const SINGLE_DEAL_PAYMENT_LINK =
  "https://buy.stripe.com/7sYbJ28Om2BEdKdeKhfUQ02";

const BROKER_PLAN_PAYMENT_LINK =
  "https://buy.stripe.com/5kQ14oaWu902ay18lTfUQ03";

function formatCurrency(value: number | null) {
  if (value == null) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function getAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function AccessPendingScreen({ userEmail }: { userEmail: string | null }) {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">
              PactAnchor Access
            </p>

            <h1 className="mt-3 text-3xl font-bold">
              Your PactAnchor access is pending.
            </h1>
          </div>

          <LogoutButton />
        </div>

        <p className="mt-4 text-base leading-7 text-slate-600">
          This account does not currently have paid access enabled. If you
          already completed payment, please make sure you are signed in with the
          same email address used at checkout.
        </p>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-900">
            Signed in email
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {userEmail ?? "Unknown"}
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm font-semibold text-amber-700">
              Single Deal Package
            </p>
            <p className="mt-2 text-3xl font-bold">$49</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Generate one synchronized small business sale document package.
            </p>
            <a
              href={SINGLE_DEAL_PAYMENT_LINK}
              className="mt-5 inline-flex w-full justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Start with One Deal
            </a>
          </div>

          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-6">
            <p className="text-sm font-semibold text-amber-800">
              Broker Launch Plan
            </p>
            <p className="mt-2 text-3xl font-bold">$149/month</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Monthly launch access for brokers and advisors preparing small
              business sale document packages.
            </p>
            <a
              href={BROKER_PLAN_PAYMENT_LINK}
              className="mt-5 inline-flex w-full justify-center rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-400"
            >
              Get Broker Launch Access
            </a>
          </div>
        </div>

        <p className="mt-8 text-xs leading-6 text-slate-500">
          PactAnchor prepares attorney-review-ready draft transaction documents.
          PactAnchor is not a law firm and does not provide legal advice.
        </p>
      </div>
    </main>
  );
}

function AccessBlockedScreen({ userEmail }: { userEmail: string | null }) {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <div className="mx-auto max-w-3xl rounded-3xl border border-red-200 bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-600">
              Access Blocked
            </p>

            <h1 className="mt-3 text-3xl font-bold">
              This account cannot access PactAnchor.
            </h1>
          </div>

          <LogoutButton />
        </div>

        <p className="mt-4 text-base leading-7 text-slate-600">
          Please contact Covenant AI Solutions LLC if you believe this is a
          mistake.
        </p>

        <p className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          Signed in as: {userEmail ?? "Unknown"}
        </p>
      </div>
    </main>
  );
}

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const adminEmails = getAdminEmails();
  const isAdmin =
    adminEmails.length > 0 &&
    adminEmails.includes((user.email ?? "").toLowerCase());

  const { data: profile } = await supabase
    .from("profiles")
    .select("access_status, plan_type")
    .eq("id", user.id)
    .maybeSingle();

  const accessStatus = isAdmin ? "admin" : profile?.access_status ?? "free";

  if (accessStatus === "blocked") {
    return <AccessBlockedScreen userEmail={user.email ?? null} />;
  }

  if (accessStatus !== "paid" && accessStatus !== "admin") {
    return <AccessPendingScreen userEmail={user.email ?? null} />;
  }

  const { data: deals, error } = await supabase
    .from("deals")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[dashboard] failed to load deals:", error);
  }

  const safeDeals = (deals ?? []) as DealRecord[];
  const totalDeals = safeDeals.length;
  const totalPurchaseValue = safeDeals.reduce(
    (sum, deal) => sum + (deal.purchase_price ?? 0),
    0
  );
  const sellerFinancingDeals = safeDeals.filter(
    (deal) => deal.seller_financing === true
  ).length;

  return (
    <main className="min-h-screen bg-slate-50 px-8 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">PactAnchor Dashboard</p>
            <h1 className="text-5xl font-semibold tracking-tight text-slate-900">
              Dashboard
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              View saved deal activity and metrics for the currently signed-in user.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isAdmin && (
              <Link
                href="/admin/beta-feedback"
                className="rounded-xl border border-amber-300 bg-amber-50 px-5 py-3 text-sm font-medium text-amber-800 hover:bg-amber-100"
              >
                Admin Feedback Review
              </Link>
            )}

            <Link
              href="/deals"
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              View All Deals
            </Link>

            <Link
              href="/deals/new"
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
            >
              New Deal
            </Link>
            
            <LogoutButton />
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-lg text-slate-500">Total Deals</p>
            <p className="mt-4 text-6xl font-semibold text-slate-900">{totalDeals}</p>
            <p className="mt-3 text-lg text-slate-600">
              Total number of deals stored in this account
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-lg text-slate-500">Total Purchase Value</p>
            <p className="mt-4 text-6xl font-semibold text-slate-900">
              {formatCurrency(totalPurchaseValue)}
            </p>
            <p className="mt-3 text-lg text-slate-600">
              Combined value of all tracked transactions
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-lg text-slate-500">Seller Financing Deals</p>
            <p className="mt-4 text-6xl font-semibold text-slate-900">
              {sellerFinancingDeals}
            </p>
            <p className="mt-3 text-lg text-slate-600">
              Number of deals that include seller financing
            </p>
          </section>
        </div>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-3xl font-semibold text-slate-900">Recent Deals</h2>
          </div>

          <div className="px-6 py-8">
            {safeDeals.length === 0 ? (
              <p className="text-lg text-slate-500">
                No deals have been saved yet. Create your first deal to get started.
              </p>
            ) : (
              <div className="grid gap-4">
                {safeDeals.slice(0, 5).map((deal) => (
                  <Link
                    key={deal.id}
                    href={`/deals/${deal.id}`}
                    className="rounded-xl border border-slate-200 px-4 py-4 hover:bg-slate-50"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-lg font-medium text-slate-900">
                          {deal.business_name || "Untitled Deal"}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Purchase Price: {formatCurrency(deal.purchase_price ?? 0)}
                        </p>
                      </div>
                      <span className="text-sm text-slate-500">Open</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}