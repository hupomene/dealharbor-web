import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import type { DealRecord } from "@/types/persistence";

function formatCurrency(value: number | null) {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function DealsPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("deals")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[deals] failed to load deals:", error);
  }

  const deals = (data ?? []) as DealRecord[];

  return (
    <main className="min-h-screen bg-slate-50 px-8 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">PactAnchor Workspace</p>
            <h1 className="text-5xl font-semibold tracking-tight text-slate-900">
              Deals
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Browse all deals associated with the currently signed-in account.
            </p>
          </div>

          <Link
            href="/deals/new"
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
          >
            New Deal
          </Link>
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-6 border-b border-slate-200 bg-slate-50 px-6 py-4 text-sm font-medium uppercase tracking-wide text-slate-500">
            <div>Business</div>
            <div>Purchase Price</div>
            <div>Down Payment</div>
            <div>Seller Financing</div>
            <div>Created</div>
            <div>Action</div>
          </div>

          {deals.length === 0 ? (
            <div className="px-6 py-14 text-center text-lg text-slate-500">
              No deals have been saved yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {deals.map((deal) => (
                <div
                  key={deal.id}
                  className="grid grid-cols-6 items-center px-6 py-5 text-sm text-slate-700"
                >
                  <div className="font-medium text-slate-900">
                    {deal.business_name || "Untitled Deal"}
                  </div>
                  <div>{formatCurrency(deal.purchase_price)}</div>
                  <div>{formatCurrency(deal.down_payment)}</div>
                  <div>{deal.seller_financing ? "Yes" : "No"}</div>
                  <div>
                    {deal.created_at
                      ? new Date(deal.created_at).toLocaleDateString()
                      : "—"}
                  </div>
                  <div>
                    <Link
                      href={`/deals/${deal.id}`}
                      className="font-medium text-slate-900 underline"
                    >
                      Open
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}