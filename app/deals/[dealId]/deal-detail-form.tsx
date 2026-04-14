"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import DocumentGeneratorPanel from "@/components/deals/document-generator-panel";

type DealFormData = {
  id: string;
  business_name: string | null;
  purchase_price: number | null;
  down_payment: number | null;
  seller_financing: boolean | null;
  created_at: string | null;

  seller_name?: string | null;
  seller_address?: string | null;
  buyer_name?: string | null;
  buyer_address?: string | null;
  agreement_date?: string | null;
  closing_date?: string | null;

  included_assets_text?: string | null;
  excluded_assets_text?: string | null;
  deposit_amount?: number | null;
  cash_at_closing?: number | null;
  seller_financing_amount?: number | null;
  seller_financing_clause?: string | null;
  allocated_inventory?: number | null;
  allocated_ffe?: number | null;
  allocated_goodwill?: number | null;
  allocation_total?: number | null;
  state?: string | null;
  non_compete_years?: number | null;
  non_compete_miles?: number | null;

  equipment_items_text?: string | null;
  closing_checklist_text?: string | null;
};

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

function normalizeDate(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

function numberToInput(value?: number | null) {
  return typeof value === "number" ? String(value) : "";
}

function parseNumberOrNull(value: string) {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function parseNumberOrZero(value: string) {
  if (value.trim() === "") return 0;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatCurrencyPreview(value: number | null) {
  if (value === null || Number.isNaN(value)) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function CalculationCard({
  title,
  formula,
  value,
  onUse,
}: {
  title: string;
  formula: string;
  value: number | null;
  onUse: () => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-xs text-slate-500">{formula}</p>
      <p className="mt-3 text-lg font-semibold text-slate-900">
        {formatCurrencyPreview(value)}
      </p>
      <button
        type="button"
        onClick={onUse}
        className="mt-3 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
      >
        Use Calculated Value
      </button>
    </div>
  );
}

export default function DealDetailForm({ deal }: { deal: DealFormData }) {
  const router = useRouter();

  const [businessName, setBusinessName] = useState(deal.business_name ?? "");
  const [purchasePrice, setPurchasePrice] = useState(numberToInput(deal.purchase_price));
  const [downPayment, setDownPayment] = useState(numberToInput(deal.down_payment));
  const [sellerFinancing, setSellerFinancing] = useState(!!deal.seller_financing);

  const [sellerName, setSellerName] = useState(deal.seller_name ?? "");
  const [sellerAddress, setSellerAddress] = useState(deal.seller_address ?? "");
  const [buyerName, setBuyerName] = useState(deal.buyer_name ?? "");
  const [buyerAddress, setBuyerAddress] = useState(deal.buyer_address ?? "");
  const [agreementDate, setAgreementDate] = useState(
    normalizeDate(deal.agreement_date)
  );
  const [closingDate, setClosingDate] = useState(
    normalizeDate(deal.closing_date)
  );

  const [includedAssetsText, setIncludedAssetsText] = useState(
    deal.included_assets_text ?? ""
  );
  const [excludedAssetsText, setExcludedAssetsText] = useState(
    deal.excluded_assets_text ?? ""
  );
  const [depositAmount, setDepositAmount] = useState(numberToInput(deal.deposit_amount));
  const [cashAtClosing, setCashAtClosing] = useState(
    numberToInput(deal.cash_at_closing)
  );
  const [sellerFinancingAmount, setSellerFinancingAmount] = useState(
    numberToInput(deal.seller_financing_amount)
  );
  const [sellerFinancingClause, setSellerFinancingClause] = useState(
    deal.seller_financing_clause ?? ""
  );
  const [allocatedInventory, setAllocatedInventory] = useState(
    numberToInput(deal.allocated_inventory)
  );
  const [allocatedFfe, setAllocatedFfe] = useState(numberToInput(deal.allocated_ffe));
  const [allocatedGoodwill, setAllocatedGoodwill] = useState(
    numberToInput(deal.allocated_goodwill)
  );
  const [allocationTotal, setAllocationTotal] = useState(
    numberToInput(deal.allocation_total)
  );
  const [stateValue, setStateValue] = useState(deal.state ?? "");
  const [nonCompeteYears, setNonCompeteYears] = useState(
    numberToInput(deal.non_compete_years)
  );
  const [nonCompeteMiles, setNonCompeteMiles] = useState(
    numberToInput(deal.non_compete_miles)
  );

  const [equipmentItemsText, setEquipmentItemsText] = useState(
    deal.equipment_items_text ?? ""
  );
  const [closingChecklistText, setClosingChecklistText] = useState(
    deal.closing_checklist_text ?? ""
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const calculatedCashAtClosing = useMemo(() => {
    const pp = parseNumberOrZero(purchasePrice);
    const da = parseNumberOrZero(downPayment);
    const sf = parseNumberOrZero(sellerFinancingAmount);
    return pp - da - sf;
  }, [purchasePrice, downPayment, sellerFinancingAmount]);

  const calculatedAllocationTotal = useMemo(() => {
    const inv = parseNumberOrZero(allocatedInventory);
    const ffe = parseNumberOrZero(allocatedFfe);
    const goodwill = parseNumberOrZero(allocatedGoodwill);
    return inv + ffe + goodwill;
  }, [allocatedInventory, allocatedFfe, allocatedGoodwill]);

  const canSave = useMemo(() => {
    return businessName.trim().length > 0 && !saving;
  }, [businessName, saving]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSaving(true);
    setError("");
    setSuccessMessage("");

    const submitBody = {
      business_name: businessName.trim(),
      purchase_price: purchasePrice !== "" ? Number(purchasePrice) : null,
      down_payment: downPayment !== "" ? Number(downPayment) : null,
      seller_financing: sellerFinancing,

      seller_name: sellerName.trim() !== "" ? sellerName.trim() : null,
      seller_address: sellerAddress.trim() !== "" ? sellerAddress.trim() : null,
      buyer_name: buyerName.trim() !== "" ? buyerName.trim() : null,
      buyer_address: buyerAddress.trim() !== "" ? buyerAddress.trim() : null,
      agreement_date: agreementDate.trim() !== "" ? agreementDate : null,
      closing_date: closingDate.trim() !== "" ? closingDate : null,

      included_assets_text:
        includedAssetsText.trim() !== "" ? includedAssetsText.trim() : null,
      excluded_assets_text:
        excludedAssetsText.trim() !== "" ? excludedAssetsText.trim() : null,
      deposit_amount: depositAmount !== "" ? Number(depositAmount) : null,
      cash_at_closing: cashAtClosing !== "" ? Number(cashAtClosing) : null,
      seller_financing_amount:
        sellerFinancingAmount !== "" ? Number(sellerFinancingAmount) : null,
      seller_financing_clause:
        sellerFinancingClause.trim() !== "" ? sellerFinancingClause.trim() : null,
      allocated_inventory:
        allocatedInventory !== "" ? Number(allocatedInventory) : null,
      allocated_ffe: allocatedFfe !== "" ? Number(allocatedFfe) : null,
      allocated_goodwill:
        allocatedGoodwill !== "" ? Number(allocatedGoodwill) : null,
      allocation_total:
        allocationTotal !== "" ? Number(allocationTotal) : null,
      state: stateValue.trim() !== "" ? stateValue.trim() : null,
      non_compete_years:
        nonCompeteYears !== "" ? Number(nonCompeteYears) : null,
      non_compete_miles:
        nonCompeteMiles !== "" ? Number(nonCompeteMiles) : null,

      equipment_items_text:
        equipmentItemsText.trim() !== "" ? equipmentItemsText.trim() : null,
      closing_checklist_text:
        closingChecklistText.trim() !== "" ? closingChecklistText.trim() : null,
    };

    console.log("SUBMIT BODY:", submitBody);

    try {
      const response = await fetch(`/api/deals/${deal.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(submitBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data?.error === "string" ? data.error : "Failed to update deal"
        );
      }

      setSuccessMessage("Deal updated successfully.");

      window.dispatchEvent(
        new CustomEvent("deal-updated", {
          detail: { dealId: deal.id },
        })
      );

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-8 flex flex-col gap-3">
          <Link
            href="/deals"
            className="text-sm font-medium text-slate-600 underline underline-offset-2 hover:text-slate-900"
          >
            ← Back to Deals
          </Link>

          <div>
            <p className="text-sm text-slate-500">PactAnchor Deal Detail</p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              {businessName || "Untitled Deal"}
            </h1>
            <p className="mt-2 text-sm text-slate-600">Deal ID: {deal.id}</p>
            <p className="mt-1 text-sm text-slate-500">
              Created: {formatDate(deal.created_at)}
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="grid gap-8">
            <section className="grid gap-5">
              <h2 className="text-lg font-semibold text-slate-900">Core Deal Info</h2>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Business Name
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  placeholder="Business name"
                  required
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Purchase Price
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                    placeholder="750000"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Down Payment
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={downPayment}
                    onChange={(e) => setDownPayment(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                    placeholder="150000"
                  />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Agreement Date
                  </label>
                  <input
                    type="date"
                    value={agreementDate}
                    onChange={(e) => setAgreementDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Closing Date
                  </label>
                  <input
                    type="date"
                    value={closingDate}
                    onChange={(e) => setClosingDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  />
                </div>
              </div>
            </section>

            <section className="grid gap-5">
              <h2 className="text-lg font-semibold text-slate-900">Parties</h2>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Seller Name
                  </label>
                  <input
                    type="text"
                    value={sellerName}
                    onChange={(e) => setSellerName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                    placeholder="Seller legal name"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Buyer Name
                  </label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                    placeholder="Buyer legal name"
                  />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Seller Address
                  </label>
                  <input
                    type="text"
                    value={sellerAddress}
                    onChange={(e) => setSellerAddress(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                    placeholder="Seller address"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Buyer Address
                  </label>
                  <input
                    type="text"
                    value={buyerAddress}
                    onChange={(e) => setBuyerAddress(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                    placeholder="Buyer address"
                  />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Governing State
                  </label>
                  <input
                    type="text"
                    value={stateValue}
                    onChange={(e) => setStateValue(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                    placeholder="Texas"
                  />
                </div>
              </div>
            </section>

            <section className="grid gap-5">
              <h2 className="text-lg font-semibold text-slate-900">Assets</h2>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Included Assets
                </label>
                <textarea
                  value={includedAssetsText}
                  onChange={(e) => setIncludedAssetsText(e.target.value)}
                  className="min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  placeholder="Furniture, fixtures, equipment, inventory, goodwill..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Excluded Assets
                </label>
                <textarea
                  value={excludedAssetsText}
                  onChange={(e) => setExcludedAssetsText(e.target.value)}
                  className="min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  placeholder="Seller cash on hand, personal vehicle, accounts receivable..."
                />
              </div>
            </section>

            <section className="grid gap-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  Payment Terms
                </h2>
              </div>

              <label className="inline-flex items-center gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={sellerFinancing}
                  onChange={(e) => setSellerFinancing(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                Seller Financing Included
              </label>

              <div className="grid gap-5 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Deposit Amount
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                    placeholder="10000"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Cash at Closing
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={cashAtClosing}
                    onChange={(e) => setCashAtClosing(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                    placeholder="250000"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Seller Financing Amount
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={sellerFinancingAmount}
                    onChange={(e) => setSellerFinancingAmount(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                    placeholder="160000"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <CalculationCard
                  title="Calculated Cash at Closing"
                  formula="Purchase Price - Deposit Amount - Seller Financing Amount"
                  value={calculatedCashAtClosing}
                  onUse={() => setCashAtClosing(String(calculatedCashAtClosing))}
                />

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    Current Cash at Closing Input
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Saved value that will be used in templates.
                  </p>
                  <p className="mt-3 text-lg font-semibold text-slate-900">
                    {formatCurrencyPreview(parseNumberOrNull(cashAtClosing))}
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Seller Financing Clause
                </label>
                <textarea
                  value={sellerFinancingClause}
                  onChange={(e) => setSellerFinancingClause(e.target.value)}
                  className="min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  placeholder="Seller shall finance a portion of the purchase price under a separate promissory note..."
                />
              </div>
            </section>

            <section className="grid gap-5">
              <h2 className="text-lg font-semibold text-slate-900">Allocation</h2>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Allocated Inventory
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={allocatedInventory}
                    onChange={(e) => setAllocatedInventory(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                    placeholder="50000"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Allocated FFE
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={allocatedFfe}
                    onChange={(e) => setAllocatedFfe(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                    placeholder="120000"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Allocated Goodwill
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={allocatedGoodwill}
                    onChange={(e) => setAllocatedGoodwill(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                    placeholder="250000"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Allocation Total
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={allocationTotal}
                    onChange={(e) => setAllocationTotal(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                    placeholder="420000"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <CalculationCard
                  title="Calculated Allocation Total"
                  formula="Allocated Inventory + Allocated FFE + Allocated Goodwill"
                  value={calculatedAllocationTotal}
                  onUse={() => setAllocationTotal(String(calculatedAllocationTotal))}
                />

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    Current Allocation Total Input
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Saved value that will be used in templates.
                  </p>
                  <p className="mt-3 text-lg font-semibold text-slate-900">
                    {formatCurrencyPreview(parseNumberOrNull(allocationTotal))}
                  </p>
                </div>
              </div>
            </section>

            <section className="grid gap-5">
              <h2 className="text-lg font-semibold text-slate-900">Non-Compete</h2>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Non-Compete Years
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={nonCompeteYears}
                    onChange={(e) => setNonCompeteYears(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                    placeholder="3"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Non-Compete Miles
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={nonCompeteMiles}
                    onChange={(e) => setNonCompeteMiles(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                    placeholder="10"
                  />
                </div>
              </div>
            </section>

            <section className="grid gap-5">
              <h2 className="text-lg font-semibold text-slate-900">Schedule Data</h2>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Equipment Items
                </label>
                <p className="mb-2 text-xs text-slate-500">
                  One item per line. Format: Description | Serial / ID | Condition
                </p>
                <textarea
                  value={equipmentItemsText}
                  onChange={(e) => setEquipmentItemsText(e.target.value)}
                  className="min-h-32 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  placeholder={"Espresso Machine | SN-1001 | Good\nPOS Terminal | POS-223 | Excellent"}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Closing Checklist
                </label>
                <p className="mb-2 text-xs text-slate-500">
                  One checklist item per line.
                </p>
                <textarea
                  value={closingChecklistText}
                  onChange={(e) => setClosingChecklistText(e.target.value)}
                  className="min-h-32 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  placeholder={"Bill of Sale executed\nAssignment of lease delivered\nInventory count completed"}
                />
              </div>
            </section>

            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {successMessage ? (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {successMessage}
              </div>
            ) : null}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={!canSave}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>

              <Link
                href="/deals"
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </Link>
            </div>
          </div>
        </form>

        <DocumentGeneratorPanel dealId={deal.id} />
      </div>
    </main>
  );
}