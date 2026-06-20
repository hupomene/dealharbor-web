"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type PlanType =
  | "single_deal"
  | "broker_launch"
  | "attorney_workflow"
  | "admin"
  | null;

type NewDealFormProps = {
  planType: PlanType;
  isSandboxMode?: boolean;
};

export default function NewDealForm({
  planType,
  isSandboxMode = false,
}: NewDealFormProps) {
  const router = useRouter();

  const isSingleDealPlan = planType === "single_deal";
  const isLockedCreationFieldsPlan = isSingleDealPlan || isSandboxMode;

  const [businessName, setBusinessName] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [sellerFinancing, setSellerFinancing] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/deals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          business_name: businessName.trim() || "Untitled Deal",
          purchase_price:
            purchasePrice.trim() === "" ? null : Number(purchasePrice),
          down_payment: downPayment.trim() === "" ? null : Number(downPayment),
          seller_financing: sellerFinancing,
          is_sandbox: isSandboxMode,
          paywall_unlocked: false,
          readiness_score: 0,
      }),
      });

      const body = await response.json();

      if (!response.ok) {
        throw new Error(body?.error || "Failed to create deal.");
      }

      const dealId = body?.deal?.id;
      if (!dealId) {
        throw new Error("Deal created but no deal id was returned.");
      }

      router.push(`/deals/${dealId}`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create new deal."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      {isLockedCreationFieldsPlan && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-slate-700">
          <p className="font-semibold text-slate-950">
            {isSandboxMode
              ? "Free Workspace starts with one sandbox deal."
              : "Important: Single Deal access starts after creation."}
          </p>
          <p className="mt-1">
            {isSandboxMode
              ? "Use this sandbox workspace to enter deal information and see Document Readiness before upgrading to download the final draft package. Business Name, Purchase Price, and Down Payment should be confirmed before creation."
              : "For Single Deal Package users, this workspace is available for 30 days from deal creation. Business Name, Purchase Price, and Down Payment are locked after creation. Please confirm these values before clicking Create Deal."}
          </p>
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Business Name{" "}
          {isLockedCreationFieldsPlan && (
            <span className="text-xs font-normal text-amber-700">
              {isSandboxMode ? "Core deal term" : "Locked after creation"}
            </span>
          )}
        </label>
        <input
          type="text"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="Sunset Family Market"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          required
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Purchase Price{" "}
            {isLockedCreationFieldsPlan && (
              <span className="text-xs font-normal text-amber-700">
                {isSandboxMode ? "Core deal term" : "Locked after creation"}
              </span>
            )}
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
            placeholder="420000"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Down Payment{" "}
            {isLockedCreationFieldsPlan && (
              <span className="text-xs font-normal text-amber-700">
                {isSandboxMode ? "Core deal term" : "Locked after creation"}
              </span>
            )}
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={downPayment}
            onChange={(e) => setDownPayment(e.target.value)}
            placeholder="80000"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
        </div>
      </div>

      <label className="flex items-center gap-3 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={sellerFinancing}
          onChange={(e) => setSellerFinancing(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300"
        />
        Include seller financing
      </label>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push(isSandboxMode ? "/dashboard" : "/deals")}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting
            ? "Creating..."
            : isSandboxMode
              ? "Create Free Workspace"
              : "Create Deal"}
        </button>
      </div>
    </form>
  );
}