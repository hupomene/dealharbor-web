import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import type { DealRecord } from "@/types/persistence";

function formatCurrency(value: number | null) {
  if (typeof value !== "number") {
    return "-";
  }

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
    redirect("/login?next=/dashboard");
  }

  const { data, error } = await supabase
    .from("deals")
    .select(
      "id,user_id,business_name,purchase_price,down_payment,seller_financing,created_at"
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const deals = (data ?? []) as DealRecord[];

  const totalDeals = deals.length;
  const totalPurchaseValue = deals.reduce(
    (sum, deal) => sum + (deal.purchase_price ?? 0),
    0
  );
  const sellerFinancingCount = deals.filter(
    (deal) => deal.seller_financing
  ).length;

  const recentDeals = deals.slice(0, 5);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-slate-500">PactAnchor Dashboard</p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              Dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              View saved deal activity and metrics for the currently signed-in user.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/deals"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              View All Deals
            </Link>
            <Link
              href="/deals/new"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              New Deal
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Total Deals</p>
            <p className="mt-3 text-4xl font-semibold text-slate-900">
              {totalDeals}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Total number of deals stored in this account
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Total Purchase Value</p>
            <p className="mt-3 text-4xl font-semibold text-slate-900">
              {formatCurrency(totalPurchaseValue)}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Combined value of all tracked transactions
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Seller Financing Deals</p>
            <p className="mt-3 text-4xl font-semibold text-slate-900">
              {sellerFinancingCount}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Number of deals that include seller financing
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Recent Deals</h2>
          </div>

          {recentDeals.length === 0 ? (
            <div className="px-6 py-10 text-sm text-slate-500">
              No deals have been saved yet. Create your first deal to get started.
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {recentDeals.map((deal) => (
                <div
                  key={deal.id}
                  className="flex flex-col gap-3 px-6 py-5 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="text-base font-medium text-slate-900">
                      {deal.business_name ?? "Untitled Deal"}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Deal ID: {deal.id}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1 text-sm text-slate-600 md:items-end">
                    <span>Purchase Price: {formatCurrency(deal.purchase_price)}</span>
                    <span>Down Payment: {formatCurrency(deal.down_payment)}</span>
                    <span>
                      Seller Financing: {deal.seller_financing ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}