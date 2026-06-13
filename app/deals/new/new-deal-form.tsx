"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type PlanType =
  | "single_deal"
  | "broker_launch"
  | "attorney_workflow"
  | "admin"
  | null;

export default function NewDealForm({ planType }: { planType: PlanType }) {
  const router = useRouter();

  const isSingleDealPlan = planType === "single_deal";

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
            {isSingleDealPlan && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-slate-700">
                <p className="font-semibold text-slate-950">
                  Important: core deal terms are locked after creation.
                </p>
                <p className="mt-1">
                  For Single Deal Package users, Business Name, Purchase Price, and
                  Down Payment cannot be changed after the deal is created. Please
                  confirm these values before clicking Create Deal.
                </p>
              </div>
            )}

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Business Name{" "}
          {isSingleDealPlan && (
            <span className="text-xs font-normal text-amber-700">
              Locked after creation
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
            {isSingleDealPlan && (
              <span className="text-xs font-normal text-amber-700">
                Locked after creation
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
            {isSingleDealPlan && (
              <span className="text-xs font-normal text-amber-700">
                Locked after creation
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
          onClick={() => router.push("/deals")}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Creating..." : "Create Deal"}
        </button>
      </div>
    </form>
  );
}