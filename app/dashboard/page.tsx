import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import type { DealRecord } from "@/types/persistence";

function formatCurrency(value: number | null) {
  if (value == null) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
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

          <div className="flex items-center gap-3">
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