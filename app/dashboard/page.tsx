import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import type { DealRecord } from "@/types/persistence";
import LogoutButton from "@/components/auth/logout-button";
import WorkspaceNav from "@/components/auth/workspace-nav";

const SINGLE_DEAL_PAYMENT_LINK =
  "https://buy.stripe.com/7sYbJ28Om2BEdKdeKhfUQ02";

const BROKER_PLAN_PAYMENT_LINK =
  "https://buy.stripe.com/5kQ14oaWu902ay18lTfUQ03";

const ATTORNEY_PLAN_CONTACT_LINK =
  "mailto:info@pactanchor.com?subject=Attorney%20Network%20%26%20Workflow%20Plan%20Early%20Access";

function formatCurrency(value: number | null) {
  if (value == null) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value?: string | null) {
  if (!value) return "Not assigned";

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function getDaysRemaining(value?: string | null) {
  if (!value) return null;

  const expires = new Date(value).getTime();
  const now = Date.now();

  return Math.ceil((expires - now) / (1000 * 60 * 60 * 24));
}

function getDealStatus(deal: DealRecord) {
  if (deal.business_name || deal.seller_name || deal.buyer_name) {
    return "Intake in progress";
  }

  return "Started";
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

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm font-semibold text-amber-700">
              Single Deal Package
            </p>

            <p className="mt-2 text-3xl font-bold">
              $49 <span className="text-sm font-medium text-slate-500">one-time</span>
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              For one specific small business sale transaction. Includes 30-day
              workspace access, PDF draft output, and document regeneration during the
              access period.
            </p>

            <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
              <li>✓ One specific business sale transaction</li>
              <li>✓ 30-day workspace access from deal creation</li>
              <li>✓ PDF draft output only</li>
              <li>✓ Document regeneration during the access period</li>
              <li>✓ Core deal terms locked after creation</li>
              <li>✓ Upgrade to Broker Launch for DOCX and ZIP exports</li>
            </ul>

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

            <p className="mt-2 text-3xl font-bold">
              $149<span className="text-sm font-medium text-slate-600">/month</span>
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-700">
              For brokers and advisors managing repeated small business sale
              transactions.
            </p>

            <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
              <li>✓ Multiple business sale deal packages</li>
              <li>✓ Editable core deal terms</li>
              <li>✓ DOCX / PDF / ZIP exports</li>
              <li>✓ Repeated broker workflow support</li>
              <li>✓ Ongoing workspace access</li>
              <li>✓ Priority feedback review</li>
            </ul>

            <a
              href={BROKER_PLAN_PAYMENT_LINK}
              className="mt-5 inline-flex w-full justify-center rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-400"
            >
              Get Broker Launch Access
            </a>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm font-semibold text-amber-700">
              Attorney Network & Workflow Plan
            </p>

            <p className="mt-2 text-3xl font-bold">
              $299<span className="text-sm font-medium text-slate-500">/month</span>
            </p>

            <p className="mt-2 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
              Coming Soon
            </p>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Grow your transaction practice with structured client intake and
              pre-synced draft packages ready for final review.
            </p>

            <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
              <li>✓ State-specific client lead network</li>
              <li>✓ Vetted deal intake with pre-synced drafts</li>
              <li>✓ Attorney dashboard for PactAnchor user deals</li>
              <li>✓ DOCX / PDF / ZIP exports for attorney workflow</li>
              <li>✓ Flat-fee software subscription, no fee-splitting</li>
              <li>✓ Not a substitute for attorney judgment</li>
            </ul>

            <a
              href={ATTORNEY_PLAN_CONTACT_LINK}
              className="mt-5 inline-flex w-full justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Contact for Early Access
            </a>
          </div>

        </div>

        <p className="mt-8 text-xs leading-6 text-slate-500">
          PactAnchor prepares attorney-review-ready draft transaction documents and
          supports document automation workflows. PactAnchor is not a law firm and
          does not provide legal, tax, or financial advice. Attorney access is
          structured as a flat-fee software subscription; PactAnchor does not share
          legal fees.
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

function QuickStartGuideCard() {
  return (
    <section className="mb-10 rounded-3xl border border-amber-200 bg-amber-50 p-7 shadow-sm">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">
            Quick Start Guide
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            New to PactAnchor?
          </h2>

          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-700">
            Follow this guided workflow to create your first
            attorney-review-ready business sale document package. PactAnchor
            helps you move from deal intake to synchronized draft documents with
            fewer manual inconsistencies.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/dashboard/guide"
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              How to Use PactAnchor
            </Link>

            <Link
              href="/deals/new"
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Create New Deal
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-white p-5">
          <p className="text-sm font-semibold text-slate-900">
            Getting started checklist
          </p>

          <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
            <li>1. Create a new deal</li>
            <li>2. Complete the guided intake</li>
            <li>3. Review buyer, seller, asset, and payment terms</li>
            <li>4. Generate the attorney-review-ready draft package</li>
            <li>5. Download PDF drafts or export DOCX/ZIP if your plan allows</li>
          </ol>
        </div>
      </div>
    </section>
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

  const planType = isAdmin ? "admin" : profile?.plan_type ?? null;

  const isSingleDealPlan = planType === "single_deal";

  const isBrokerLikePlan =
    planType === "broker_launch" ||
    planType === "attorney_workflow" ||
    planType === "admin";

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

  const currentDeal = safeDeals[0] ?? null;

  const currentDealDaysRemaining = currentDeal
    ? getDaysRemaining((currentDeal as DealRecord & { access_expires_at?: string | null }).access_expires_at)
    : null;

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
              Continue your current deal, review recent activity, and generate your business sale document package.
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

            <WorkspaceNav showDashboard={false} />
          </div>
        </div>

        <QuickStartGuideCard />

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

        {isSingleDealPlan && currentDeal && (
          <section className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-7 shadow-sm">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">
                  Continue Current Deal
                </p>

                <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                  {currentDeal.business_name || "Untitled Deal"}
                </h2>

                <div className="mt-4 grid gap-2 text-sm leading-6 text-slate-700 md:grid-cols-2">
                  <p>
                    <span className="font-semibold text-slate-900">Status:</span>{" "}
                    {getDealStatus(currentDeal)}
                  </p>

                  <p>
                    <span className="font-semibold text-slate-900">
                      Purchase Price:
                    </span>{" "}
                    {formatCurrency(currentDeal.purchase_price ?? 0)}
                  </p>

                  <p>
                    <span className="font-semibold text-slate-900">
                      Access remaining:
                    </span>{" "}
                    {currentDealDaysRemaining === null
                      ? "Not assigned"
                      : currentDealDaysRemaining <= 0
                      ? "Expired"
                      : `${currentDealDaysRemaining} day(s)`}
                  </p>

                  <p>
                    <span className="font-semibold text-slate-900">Next step:</span>{" "}
                    Complete intake fields and generate documents.
                  </p>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-600">
                  Single Deal Package users can continue working on this specific
                  transaction during the access period and regenerate PDF draft documents.
                  DOCX and ZIP exports are available with Broker Launch Plan.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Link
                  href={`/deals/${currentDeal.id}`}
                  className="rounded-xl bg-slate-900 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Continue Deal
                </Link>

                <Link
                  href="/dashboard/guide"
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  View Guide
                </Link>
              </div>
            </div>
          </section>
        )}

        {isSingleDealPlan && !currentDeal && (
          <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              Start Your Deal
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
              Create your Single Deal workspace
            </h2>

            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
              Your Single Deal Package is designed for one specific business sale
              transaction. After creation, Business Name, Purchase Price, and Down
              Payment will be locked for that deal. Single Deal includes PDF draft output
              only during the access period.
            </p>

            <Link
              href="/deals/new"
              className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Create New Deal
            </Link>
          </section>
        )}

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-3xl font-semibold text-slate-900">
              {isSingleDealPlan ? "Your Deal" : "Recent Deals"}
            </h2>
          </div>

          <div className="px-6 py-8">
            {safeDeals.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6">
                <p className="text-lg font-semibold text-slate-900">
                  No deals have been saved yet.
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Create your first deal to begin the guided intake and document generation workflow.
                </p>

                <Link
                  href="/deals/new"
                  className="mt-5 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Create New Deal
                </Link>
              </div>
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
                        <div className="mt-1 grid gap-1 text-sm text-slate-500 md:grid-cols-2">
                          <p>Purchase Price: {formatCurrency(deal.purchase_price ?? 0)}</p>
                          <p>Status: {getDealStatus(deal)}</p>
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
                        Continue
                      </span>
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