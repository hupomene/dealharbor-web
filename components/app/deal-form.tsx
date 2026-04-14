"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ClosingChecklistItem,
  Deal,
  EquipmentItem,
} from "@/lib/types/deal";
import DealTabs, { DealTabKey } from "@/components/app/deal-tabs";

export type DealFormValues = {
  businessName: string;
  state: string;
  dealType: string;

  sellerName: string;
  sellerAddress: string;

  buyerName: string;
  buyerAddress: string;

  purchasePrice: string;
  depositAmount: string;
  closingDate: string;

  sellerFinancingEnabled: boolean;
  sellerFinancingAmount: string;

  allocatedInventory: string;
  allocatedFFE: string;
  allocatedGoodwill: string;

  includedAssetsText: string;
  excludedAssetsText: string;

  nonCompeteYears: string;
  nonCompeteMiles: string;

  equipmentItems: EquipmentItem[];
  closingChecklistItems: ClosingChecklistItem[];
};

type DealFormProps = {
  initialValues?: DealFormValues;
  values?: DealFormValues;
  onValuesChange?: (values: DealFormValues) => void;
  autosaveStatus?: "idle" | "saving" | "saved" | "error";
  lastSavedAt?: string | null;
  submitLabel?: string;
  hideSubmit?: boolean;
  onSubmit?: (values: DealFormValues) => void;
};

const defaultValues: DealFormValues = {
  businessName: "",
  state: "",
  dealType: "Asset Purchase",

  sellerName: "",
  sellerAddress: "",

  buyerName: "",
  buyerAddress: "",

  purchasePrice: "",
  depositAmount: "",
  closingDate: "",

  sellerFinancingEnabled: false,
  sellerFinancingAmount: "",

  allocatedInventory: "",
  allocatedFFE: "",
  allocatedGoodwill: "",

  includedAssetsText: "",
  excludedAssetsText: "",

  nonCompeteYears: "",
  nonCompeteMiles: "",

  equipmentItems: [
    {
      id: `eq-${Date.now()}-1`,
      name: "",
      quantity: "",
      notes: "",
    },
  ],
  closingChecklistItems: [
    {
      id: `cl-${Date.now()}-1`,
      label: "Execute Asset Purchase Agreement",
      completed: false,
    },
  ],
};

export default function DealForm({
  initialValues,
  values,
  onValuesChange,
  autosaveStatus = "idle",
  lastSavedAt = null,
  submitLabel = "Save Deal",
  hideSubmit = false,
  onSubmit,
}: DealFormProps) {
  const controlled = values !== undefined && onValuesChange !== undefined;
  const [internalForm, setInternalForm] = useState<DealFormValues>(
    initialValues ?? defaultValues
  );
  const [activeTab, setActiveTab] = useState<DealTabKey>("overview");

  useEffect(() => {
    if (!controlled && initialValues) {
      setInternalForm(initialValues);
    }
  }, [controlled, initialValues]);

  const form = useMemo(
    () => (controlled ? (values as DealFormValues) : internalForm),
    [controlled, values, internalForm]
  );

  const filledEquipmentCount = useMemo(
    () =>
      form.equipmentItems.filter(
        (item) => item.name.trim() || item.quantity.trim() || item.notes.trim()
      ).length,
    [form.equipmentItems]
  );

  const filledChecklistCount = useMemo(
    () =>
      form.closingChecklistItems.filter((item) => item.label.trim()).length,
    [form.closingChecklistItems]
  );

  function setNextForm(next: DealFormValues) {
    if (controlled) {
      onValuesChange?.(next);
    } else {
      setInternalForm(next);
    }
  }

  function update<K extends keyof DealFormValues>(
    key: K,
    value: DealFormValues[K]
  ) {
    setNextForm({ ...form, [key]: value });
  }

  function updateEquipmentItem(
    itemId: string,
    key: keyof EquipmentItem,
    value: string
  ) {
    setNextForm({
      ...form,
      equipmentItems: form.equipmentItems.map((item) =>
        item.id === itemId ? { ...item, [key]: value } : item
      ),
    });
  }

  function addEquipmentItem(prefill?: Partial<EquipmentItem>) {
    setNextForm({
      ...form,
      equipmentItems: [
        ...form.equipmentItems,
        {
          id: `eq-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          name: prefill?.name ?? "",
          quantity: prefill?.quantity ?? "",
          notes: prefill?.notes ?? "",
        },
      ],
    });
  }

  function removeEquipmentItem(itemId: string) {
    const nextItems = form.equipmentItems.filter((item) => item.id !== itemId);
    setNextForm({
      ...form,
      equipmentItems: nextItems.length > 0 ? nextItems : defaultValues.equipmentItems,
    });
  }

  function fillSampleEquipment() {
    setNextForm({
      ...form,
      equipmentItems: [
        {
          id: `eq-${Date.now()}-sample-1`,
          name: "Hydraulic Lift",
          quantity: "2",
          notes: "In operating condition",
        },
        {
          id: `eq-${Date.now()}-sample-2`,
          name: "Tire Balancer",
          quantity: "1",
          notes: "Transferred as-is",
        },
      ],
    });
  }

  function updateChecklistItem(itemId: string, nextLabel: string) {
    setNextForm({
      ...form,
      closingChecklistItems: form.closingChecklistItems.map((item) =>
        item.id === itemId ? { ...item, label: nextLabel } : item
      ),
    });
  }

  function toggleChecklistCompleted(itemId: string, completed: boolean) {
    setNextForm({
      ...form,
      closingChecklistItems: form.closingChecklistItems.map((item) =>
        item.id === itemId ? { ...item, completed } : item
      ),
    });
  }

  function addChecklistItem(prefillLabel?: string) {
    setNextForm({
      ...form,
      closingChecklistItems: [
        ...form.closingChecklistItems,
        {
          id: `cl-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          label: prefillLabel ?? "",
          completed: false,
        },
      ],
    });
  }

  function removeChecklistItem(itemId: string) {
    const nextItems = form.closingChecklistItems.filter(
      (item) => item.id !== itemId
    );
    setNextForm({
      ...form,
      closingChecklistItems:
        nextItems.length > 0 ? nextItems : defaultValues.closingChecklistItems,
    });
  }

  function fillSampleChecklist() {
    setNextForm({
      ...form,
      closingChecklistItems: [
        {
          id: `cl-${Date.now()}-sample-1`,
          label: "Execute Asset Purchase Agreement",
          completed: false,
        },
        {
          id: `cl-${Date.now()}-sample-2`,
          label: "Deliver Bill of Sale",
          completed: false,
        },
        {
          id: `cl-${Date.now()}-sample-3`,
          label: "Confirm lease assignment or new lease",
          completed: false,
        },
      ],
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit?.(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <DealTabs activeTab={activeTab} onChange={setActiveTab} />

          <div className="flex items-center justify-between gap-3 lg:justify-end">
            <AutosaveStatus
              status={autosaveStatus}
              lastSavedAt={lastSavedAt}
              hidden={!controlled}
            />

            {!hideSubmit ? (
              <button
                type="submit"
                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                {submitLabel}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {activeTab === "overview" ? (
        <CardSection
          title="Business Overview"
          description="Core information about the business and transaction structure."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Business Name"
              value={form.businessName}
              onChange={(value) => update("businessName", value)}
              placeholder="North Ridge Auto Care"
            />
            <Field
              label="State"
              value={form.state}
              onChange={(value) => update("state", value)}
              placeholder="Texas"
            />
            <Field
              label="Deal Type"
              value={form.dealType}
              onChange={(value) => update("dealType", value)}
              placeholder="Asset Purchase"
            />
          </div>
        </CardSection>
      ) : null}

      {activeTab === "parties" ? (
        <CardSection
          title="Parties"
          description="Identify the seller and buyer participating in the transaction."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Seller Name"
              value={form.sellerName}
              onChange={(value) => update("sellerName", value)}
              placeholder="Oak Street Holdings LLC"
            />
            <Field
              label="Buyer Name"
              value={form.buyerName}
              onChange={(value) => update("buyerName", value)}
              placeholder="North Ridge Ventures LLC"
            />
            <TextAreaField
              label="Seller Address"
              value={form.sellerAddress}
              onChange={(value) => update("sellerAddress", value)}
              placeholder="1450 Oak Street, Dallas, TX 75201"
            />
            <TextAreaField
              label="Buyer Address"
              value={form.buyerAddress}
              onChange={(value) => update("buyerAddress", value)}
              placeholder="890 Preston Ridge Blvd, Plano, TX 75024"
            />
          </div>
        </CardSection>
      ) : null}

      {activeTab === "terms" ? (
        <CardSection
          title="Purchase Terms"
          description="Define the purchase economics and target closing date."
        >
          <div className="grid gap-4 md:grid-cols-3">
            <Field
              label="Purchase Price"
              value={form.purchasePrice}
              onChange={(value) => update("purchasePrice", value)}
              placeholder="$850,000"
            />
            <Field
              label="Deposit / Down Payment"
              value={form.depositAmount}
              onChange={(value) => update("depositAmount", value)}
              placeholder="$50,000"
            />
            <DateField
              label="Closing Date"
              value={form.closingDate}
              onChange={(value) => update("closingDate", value)}
            />
          </div>
        </CardSection>
      ) : null}

      {activeTab === "financing" ? (
        <CardSection
          title="Seller Financing"
          description="Toggle financing terms to include or remove the promissory note."
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <label className="inline-flex cursor-pointer items-center gap-3">
              <span className="text-sm font-medium text-slate-700">Enabled</span>
              <input
                type="checkbox"
                checked={form.sellerFinancingEnabled}
                onChange={(e) =>
                  update("sellerFinancingEnabled", e.target.checked)
                }
                className="h-4 w-4 rounded border-slate-300"
              />
            </label>
          </div>

          <div className="mt-5">
            <Field
              label="Seller Financing Amount"
              value={form.sellerFinancingAmount}
              onChange={(value) => update("sellerFinancingAmount", value)}
              placeholder="$200,000"
              disabled={!form.sellerFinancingEnabled}
            />
          </div>
        </CardSection>
      ) : null}

      {activeTab === "assets" ? (
        <CardSection
          title="Assets & Allocation"
          description="Capture allocation and asset scope for the APA and schedules."
        >
          <div className="grid gap-4 md:grid-cols-3">
            <Field
              label="Allocation - Inventory"
              value={form.allocatedInventory}
              onChange={(value) => update("allocatedInventory", value)}
              placeholder="$120,000"
            />
            <Field
              label="Allocation - FFE"
              value={form.allocatedFFE}
              onChange={(value) => update("allocatedFFE", value)}
              placeholder="$180,000"
            />
            <Field
              label="Allocation - Goodwill"
              value={form.allocatedGoodwill}
              onChange={(value) => update("allocatedGoodwill", value)}
              placeholder="$550,000"
            />
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <TextAreaField
              label="Included Assets"
              value={form.includedAssetsText}
              onChange={(value) => update("includedAssetsText", value)}
              placeholder="Inventory, equipment, customer lists, trade name, goodwill..."
            />
            <TextAreaField
              label="Excluded Assets"
              value={form.excludedAssetsText}
              onChange={(value) => update("excludedAssetsText", value)}
              placeholder="Cash on hand, seller bank accounts, personal tools..."
            />
          </div>
        </CardSection>
      ) : null}

      {activeTab === "restrictions" ? (
        <CardSection
          title="Non-Compete"
          description="Define the covenant scope for the non-compete agreement."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Non-Compete Term (Years)"
              value={form.nonCompeteYears}
              onChange={(value) => update("nonCompeteYears", value)}
              placeholder="5"
            />
            <Field
              label="Non-Compete Radius (Miles)"
              value={form.nonCompeteMiles}
              onChange={(value) => update("nonCompeteMiles", value)}
              placeholder="25"
            />
          </div>
        </CardSection>
      ) : null}

      {activeTab === "closing" ? (
        <div className="space-y-6">
          <CardSection
            title="Equipment Schedule"
            description="List equipment items for the equipment schedule and bill of sale."
          >
            <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  Filled equipment rows: {filledEquipmentCount}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Empty rows are automatically ignored in document payloads.
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={fillSampleEquipment}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-white"
                >
                  Load Sample Equipment
                </button>
                <button
                  type="button"
                  onClick={() => addEquipmentItem()}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Add Equipment Item
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {form.equipmentItems.map((item, index) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        Equipment Item {index + 1}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        Name and quantity are the most important fields.
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeEquipmentItem(item.id)}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <Field
                      label="Item Name"
                      value={item.name}
                      onChange={(value) =>
                        updateEquipmentItem(item.id, "name", value)
                      }
                      placeholder="Hydraulic Lift"
                    />
                    <Field
                      label="Quantity"
                      value={item.quantity}
                      onChange={(value) =>
                        updateEquipmentItem(item.id, "quantity", value)
                      }
                      placeholder="2"
                    />
                    <Field
                      label="Notes"
                      value={item.notes}
                      onChange={(value) =>
                        updateEquipmentItem(item.id, "notes", value)
                      }
                      placeholder="In operating condition"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardSection>

          <CardSection
            title="Closing Checklist"
            description="Track closing deliverables and include them in the checklist document."
          >
            <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  Filled checklist rows: {filledChecklistCount}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Blank checklist rows are automatically excluded from document payloads.
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={fillSampleChecklist}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-white"
                >
                  Load Sample Checklist
                </button>
                <button
                  type="button"
                  onClick={() => addChecklistItem()}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Add Checklist Item
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {form.closingChecklistItems.map((item, index) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-900">
                      Checklist Item {index + 1}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeChecklistItem(item.id)}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_140px]">
                    <Field
                      label="Checklist Label"
                      value={item.label}
                      onChange={(value) => updateChecklistItem(item.id, value)}
                      placeholder="Execute Asset Purchase Agreement"
                    />

                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-slate-700">
                        Completed
                      </span>
                      <div className="flex h-[46px] items-center rounded-xl border border-slate-300 bg-white px-4">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={(e) =>
                            toggleChecklistCompleted(item.id, e.target.checked)
                          }
                          className="h-4 w-4 rounded border-slate-300"
                        />
                      </div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </CardSection>
        </div>
      ) : null}

      {activeTab === "documents" ? (
        <CardSection
          title="Documents"
          description="The generated contract package appears in the right-side panel."
        >
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm font-medium text-slate-900">
              Available in this package
            </div>
            <ul className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
              <li>• Asset Purchase Agreement</li>
              {form.sellerFinancingEnabled ? <li>• Promissory Note</li> : null}
              <li>• Bill of Sale</li>
              <li>• Non-Compete Agreement</li>
              <li>• Equipment List</li>
              <li>• Closing Checklist</li>
            </ul>
          </div>
        </CardSection>
      ) : null}
    </form>
  );
}

function CardSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      ) : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function AutosaveStatus({
  status,
  lastSavedAt,
  hidden,
}: {
  status: "idle" | "saving" | "saved" | "error";
  lastSavedAt: string | null;
  hidden?: boolean;
}) {
  if (hidden) return null;

  const label =
    status === "saving"
      ? "Saving..."
      : status === "saved"
      ? "Saved"
      : status === "error"
      ? "Save failed"
      : "Ready";

  const color =
    status === "saving"
      ? "bg-amber-50 text-amber-700"
      : status === "saved"
      ? "bg-emerald-50 text-emerald-700"
      : status === "error"
      ? "bg-red-50 text-red-700"
      : "bg-slate-100 text-slate-600";

  return (
    <div className="flex flex-col items-start gap-1 text-left lg:items-end">
      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${color}`}>
        {label}
      </span>
      {lastSavedAt ? (
        <span className="text-xs text-slate-500">
          Last saved {new Date(lastSavedAt).toLocaleTimeString()}
        </span>
      ) : null}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 disabled:cursor-not-allowed disabled:bg-slate-100"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={5}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900"
      />
    </label>
  );
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </span>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900"
      />
    </label>
  );
}

export function dealToFormValues(deal: Deal): DealFormValues {
  return {
    businessName: deal.businessName,
    state: deal.state,
    dealType: deal.dealType,

    sellerName: deal.sellerName,
    sellerAddress: deal.sellerAddress,

    buyerName: deal.buyerName,
    buyerAddress: deal.buyerAddress,

    purchasePrice: deal.purchasePrice,
    depositAmount: deal.depositAmount,
    closingDate: deal.closingDate,

    sellerFinancingEnabled: deal.sellerFinancingEnabled,
    sellerFinancingAmount: deal.sellerFinancingAmount,

    allocatedInventory: deal.allocatedInventory,
    allocatedFFE: deal.allocatedFFE,
    allocatedGoodwill: deal.allocatedGoodwill,

    includedAssetsText: deal.includedAssetsText,
    excludedAssetsText: deal.excludedAssetsText,

    nonCompeteYears: deal.nonCompeteYears,
    nonCompeteMiles: deal.nonCompeteMiles,

    equipmentItems: deal.equipmentItems,
    closingChecklistItems: deal.closingChecklistItems,
  };
}