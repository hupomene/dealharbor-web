"use client";

import { cn } from "@/lib/utils";

export type DealTabKey =
  | "overview"
  | "parties"
  | "terms"
  | "financing"
  | "assets"
  | "restrictions"
  | "closing"
  | "documents";

const tabs: Array<{ key: DealTabKey; label: string }> = [
  { key: "overview", label: "Overview" },
  { key: "parties", label: "Parties" },
  { key: "terms", label: "Purchase Terms" },
  { key: "financing", label: "Financing" },
  { key: "assets", label: "Assets & Allocation" },
  { key: "restrictions", label: "Non-Compete" },
  { key: "closing", label: "Equipment & Closing" },
  { key: "documents", label: "Documents" },
];

type DealTabsProps = {
  activeTab: DealTabKey;
  onChange: (tab: DealTabKey) => void;
};

export default function DealTabs({ activeTab, onChange }: DealTabsProps) {
  return (
    <div className="overflow-x-auto">
      <div className="inline-flex min-w-full gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={cn(
              "rounded-xl px-4 py-2.5 text-sm font-semibold transition whitespace-nowrap",
              activeTab === tab.key
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}