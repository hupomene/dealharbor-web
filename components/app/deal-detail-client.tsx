"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Topbar from "@/components/app/topbar";
import DealForm, {
  dealToFormValues,
  DealFormValues,
} from "@/components/app/deal-form";
import DealDocumentsPanel from "@/components/app/deal-documents-panel";
import { getDealById, updateDeal } from "@/lib/storage/deals";
import { Deal } from "@/lib/types/deal";

type DealDetailClientProps = {
  dealId: string;
};

export default function DealDetailClient({ dealId }: DealDetailClientProps) {
  const [deal, setDeal] = useState<Deal | null>(null);
  const [formValues, setFormValues] = useState<DealFormValues | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [autosaveStatus, setAutosaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const lastSavedSignatureRef = useRef<string>("");

  useEffect(() => {
    const foundDeal = getDealById(dealId) ?? null;
    setDeal(foundDeal);

    if (foundDeal) {
      const nextValues = dealToFormValues(foundDeal);
      setFormValues(nextValues);
      lastSavedSignatureRef.current = JSON.stringify(nextValues);
      setLastSavedAt(foundDeal.updatedAt);
      setAutosaveStatus("saved");
    }

    setIsLoading(false);
  }, [dealId]);

  useEffect(() => {
    if (!deal || !formValues) return;

    const currentSignature = JSON.stringify(formValues);

    if (currentSignature === lastSavedSignatureRef.current) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      try {
        setAutosaveStatus("saving");

        const updated = updateDeal({
          ...deal,
          ...formValues,
        });

        setDeal(updated);
        setLastSavedAt(updated.updatedAt);

        const savedSignature = JSON.stringify(dealToFormValues(updated));
        lastSavedSignatureRef.current = savedSignature;
        setFormValues(dealToFormValues(updated));
        setAutosaveStatus("saved");
      } catch {
        setAutosaveStatus("error");
      }
    }, 800);

    return () => window.clearTimeout(timeoutId);
  }, [deal, formValues]);

  const dealDescription = useMemo(() => {
    if (!deal) return "";
    return `${deal.dealType} • ${deal.state} • Last updated ${new Date(
      deal.updatedAt
    ).toLocaleString()}`;
  }, [deal]);

  function handleFormValuesChange(values: DealFormValues) {
    setAutosaveStatus("saving");
    setFormValues(values);
  }

  function handleDealUpdated(nextDeal: Deal) {
    setDeal(nextDeal);
    setLastSavedAt(nextDeal.updatedAt);
  }

  if (isLoading) {
    return (
      <>
        <Topbar
          title="Loading Deal..."
          description="Reading deal workspace from local storage."
        />
        <div className="p-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm text-slate-600">Loading deal data...</p>
          </div>
        </div>
      </>
    );
  }

  if (!deal || !formValues) {
    return (
      <>
        <Topbar
          title="Deal Not Found"
          description="This deal could not be found in local storage."
        />
        <div className="p-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm text-slate-600">
              The requested deal does not exist. Go back to the deals list and
              create a new one.
            </p>

            <div className="mt-4">
              <Link
                href="/deals"
                className="inline-flex rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
              >
                Back to Deals
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Topbar title={deal.businessName} description={dealDescription} />

      <div className="grid gap-6 p-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <DealForm
          values={formValues}
          onValuesChange={handleFormValuesChange}
          autosaveStatus={autosaveStatus}
          lastSavedAt={lastSavedAt}
          hideSubmit
        />

        <div className="xl:sticky xl:top-6 xl:self-start">
          <DealDocumentsPanel deal={deal} onDealUpdated={handleDealUpdated} />
        </div>
      </div>
    </>
  );
}