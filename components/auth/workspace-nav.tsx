import Link from "next/link";
import LogoutButton from "@/components/auth/logout-button";

type WorkspaceNavProps = {
  showDashboard?: boolean;
  showDeals?: boolean;
  showNewDeal?: boolean;
};

export default function WorkspaceNav({
  showDashboard = true,
  showDeals = true,
  showNewDeal = true,
}: WorkspaceNavProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {showDashboard && (
        <Link
          href="/dashboard"
          className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Dashboard
        </Link>
      )}

      {showDeals && (
        <Link
          href="/deals"
          className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Deals
        </Link>
      )}

      {showNewDeal && (
        <Link
          href="/deals/new"
          className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
        >
          New Deal
        </Link>
      )}

      <LogoutButton />
    </div>
  );
}