import Link from "next/link";
import { Deal } from "@/lib/types/deal";

type RecentDealsProps = {
  deals: Deal[];
};

export default function RecentDeals({ deals }: RecentDealsProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-slate-950">Recent Deals</h2>
      </div>

      <div className="divide-y divide-slate-200">
        {deals.length === 0 ? (
          <div className="px-6 py-8 text-sm text-slate-500">No deals yet.</div>
        ) : (
          deals.map((deal) => (
            <div
              key={deal.id}
              className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="text-base font-semibold text-slate-950">
                  {deal.businessName}
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  {deal.sellerName} → {deal.buyerName}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {deal.dealType} • {deal.state} • {deal.purchasePrice}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  {deal.generatedDocuments.length} docs
                </span>
                <Link
                  href={`/deals/${deal.id}`}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
                >
                  Open
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}