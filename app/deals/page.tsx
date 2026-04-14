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

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
}

export default async function DealsPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/deals");
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

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-slate-500">PactAnchor Workspace</p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              Deals
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Browse all deals associated with the currently signed-in account.
            </p>
          </div>

          <Link
            href="/deals/new"
            className="inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            New Deal
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Business
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Purchase Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Down Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Seller Financing
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 bg-white">
                {deals.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-10 text-center text-sm text-slate-500"
                    >
                      No deals have been saved yet.
                    </td>
                  </tr>
                ) : (
                  deals.map((deal) => (
                    <tr key={deal.id}>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {deal.business_name ?? "Untitled Deal"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {formatCurrency(deal.purchase_price)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {formatCurrency(deal.down_payment)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {deal.seller_financing ? "Yes" : "No"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {formatDate(deal.created_at)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Link
                          href={`/deals/${deal.id}`}
                          className="text-slate-900 underline underline-offset-2 hover:text-slate-700"
                        >
                          Open
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}