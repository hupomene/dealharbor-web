"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewDealForm() {
  const router = useRouter();

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
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Business Name
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
            Purchase Price
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
            Down Payment
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