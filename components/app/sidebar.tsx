"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Deals", href: "/deals" },
  { label: "New Deal", href: "/deals/new" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full border-b border-slate-200 bg-white lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r">
      <div className="flex h-16 items-center border-b border-slate-200 px-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
            P
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-950">PactAnchor</div>
            <div className="text-xs text-slate-500">Deal Workspace</div>
          </div>
        </Link>
      </div>

      <div className="p-4">
        <nav className="grid gap-2">
          {items.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200",
                  active
                    ? "border border-slate-900 bg-slate-900 text-white shadow-sm hover:bg-slate-800 hover:text-white"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                )}
              >
                <span className="text-inherit">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}