import { Deal } from "@/lib/types/deal";

type DashboardStatsProps = {
  deals: Deal[];
};

export default function DashboardStats({ deals }: DashboardStatsProps) {
  const totalDeals = deals.length;
  const totalDocuments = deals.reduce(
    (sum, deal) => sum + deal.generatedDocuments.length,
    0
  );
  const sellerFinancingDeals = deals.filter(
    (deal) => deal.sellerFinancingEnabled
  ).length;

  const stats = [
    {
      label: "Total Deals",
      value: totalDeals,
      hint: "Tracked in workspace",
    },
    {
      label: "Generated Documents",
      value: totalDocuments,
      hint: "Across all active deals",
    },
    {
      label: "Seller Financing Deals",
      value: sellerFinancingDeals,
      hint: "Promissory note included",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="text-sm font-medium text-slate-500">{stat.label}</div>
          <div className="mt-3 text-3xl font-bold text-slate-950">
            {stat.value}
          </div>
          <div className="mt-2 text-sm text-slate-600">{stat.hint}</div>
        </div>
      ))}
    </div>
  );
}