"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import DocumentGeneratorPanel from "@/components/deals/document-generator-panel";
import LiveDocumentPreviewPanel from "@/components/deals/live-document-preview-panel";
import WorkspaceNav from "@/components/auth/workspace-nav";

type DealFormData = {
  id: string;
  business_name: string | null;
  purchase_price: number | null;
  down_payment: number | null;
  seller_financing: boolean | null;
  created_at: string | null;
  access_expires_at?: string | null;
  is_sandbox?: boolean | null;
  paywall_unlocked?: boolean | null;
  readiness_score?: number | null;

  business_type?: string | null;
  business_location?: string | null;
  buyer_state_of_organization?: string | null;
  seller_state_of_organization?: string | null;
  seller_ein?: string | null;
  closing_method?: string | null;

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
  allocated_leasehold?: number | null;
  allocated_customer_contracts?: number | null;
  allocated_trade_name?: number | null;
  allocated_non_compete?: number | null;
  allocated_goodwill?: number | null;
  allocation_total?: number | null;
  state?: string | null;
  non_compete_years?: number | null;
  non_compete_miles?: number | null;

  equipment_items_text?: string | null;
  closing_checklist_text?: string | null;
  assumed_liabilities_text?: string | null;
  excluded_liabilities_text?: string | null;

  promissory_interest_rate?: number | null;
  promissory_term_months?: number | null;
  promissory_first_payment_date?: string | null;
  promissory_maturity_date?: string | null;

  non_compete_restricted_business?: string | null;
  non_compete_territory?: string | null;

  escrow_agent_name?: string | null;
  escrow_agent_address?: string | null;
  escrow_deposit_amount?: number | null;
  escrow_release_condition?: string | null;

  lease_assignment_required?: boolean | null;
  landlord_consent_required?: boolean | null;
  lease_assignment_condition?: string | null;

  due_diligence_period_days?: number | null;
  due_diligence_items_text?: string | null;
  due_diligence_condition?: string | null;
};

type PlanType =
  | "single_deal"
  | "broker_launch"
  | "attorney_workflow"
  | "admin"
  | null;

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addMonths(date: Date, months: number) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

function getAutoFirstPaymentDate(closingDate: string) {
  if (!closingDate) return "";

  const closing = new Date(`${closingDate}T00:00:00`);
  const afterOneMonth = addMonths(closing, 1);

  return toIsoDate(
    new Date(afterOneMonth.getFullYear(), afterOneMonth.getMonth() + 1, 1)
  );
}

function getAutoMaturityDate(firstPaymentDate: string, termMonths: string) {
  if (!firstPaymentDate || !termMonths) return "";

  const months = Number(termMonths);
  if (!months || Number.isNaN(months)) return "";

  const firstPayment = new Date(`${firstPaymentDate}T00:00:00`);
  const maturityBase = addMonths(firstPayment, months);

  maturityBase.setDate(maturityBase.getDate() - 1);

  return toIsoDate(maturityBase);
}

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

function getDaysRemaining(expiresAt?: string | null) {
  if (!expiresAt) return null;

  const expires = new Date(expiresAt).getTime();
  const now = Date.now();

  const diff = expires - now;

  return Math.ceil(diff / (1000 * 60 * 60 * 24));
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

export default function DealDetailForm({
  deal,
  planType,
}: {
  deal: DealFormData;
  planType: PlanType;
}) {
  const router = useRouter();

  const isSingleDealPlan = planType === "single_deal";

  const isBrokerLikePlan =
    planType === "broker_launch" ||
    planType === "attorney_workflow" ||
    planType === "admin";

  const isSandboxDeal = deal.is_sandbox === true;

  const canExportDocuments =
    deal.paywall_unlocked === true || isBrokerLikePlan || !isSandboxDeal;

  const accessDaysRemaining = getDaysRemaining(deal.access_expires_at);

  const isSingleDealExpired =
    !isSandboxDeal &&
    isSingleDealPlan &&
    accessDaysRemaining !== null &&
    accessDaysRemaining <= 0;

  const canEditLockedCreationFields =
    isSandboxDeal ||
    planType === "broker_launch" ||
    planType === "attorney_workflow" ||
    planType === "admin";

  const canSaveDealDetails = !isSingleDealExpired;

  const editableFieldClassName =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500";

  const lockedFieldClassName =
    "w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500 outline-none";

  const lockedFieldHelpText =
     "Locked for Single Deal Package users. Business Name, Purchase Price, and Down Payment are set at deal creation.";

  const [businessName, setBusinessName] = useState(deal.business_name ?? "");
  const [purchasePrice, setPurchasePrice] = useState(numberToInput(deal.purchase_price));
  const [businessType, setBusinessType] = useState(deal.business_type ?? "");
  const [businessLocation, setBusinessLocation] = useState(
    deal.business_location ?? ""
  );
  const [closingMethod, setClosingMethod] = useState(
    deal.closing_method ?? ""
  );
  const [downPayment, setDownPayment] = useState(numberToInput(deal.down_payment));
  const [sellerFinancing, setSellerFinancing] = useState(!!deal.seller_financing);

  const [sellerName, setSellerName] = useState(deal.seller_name ?? "");
  const [sellerAddress, setSellerAddress] = useState(deal.seller_address ?? "");
  const [sellerStateOfOrganization, setSellerStateOfOrganization] = useState(
    deal.seller_state_of_organization ?? ""
  );
  const [sellerEin, setSellerEin] = useState(deal.seller_ein ?? "");

  const [buyerName, setBuyerName] = useState(deal.buyer_name ?? "");
  const [buyerAddress, setBuyerAddress] = useState(deal.buyer_address ?? "");
  const [buyerStateOfOrganization, setBuyerStateOfOrganization] = useState(
    deal.buyer_state_of_organization ?? ""
  );
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
  const [allocatedLeasehold, setAllocatedLeasehold] = useState(
    numberToInput(deal.allocated_leasehold)
  );
  const [allocatedCustomerContracts, setAllocatedCustomerContracts] = useState(
    numberToInput(deal.allocated_customer_contracts)
  );
  const [allocatedTradeName, setAllocatedTradeName] = useState(
    numberToInput(deal.allocated_trade_name)
  );
  const [allocatedGoodwill, setAllocatedGoodwill] = useState(
    numberToInput(deal.allocated_goodwill)
  );
  const [allocatedNonCompete, setAllocatedNonCompete] = useState(
    numberToInput(deal.allocated_non_compete)
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

  const [assumedLiabilitiesText, setAssumedLiabilitiesText] = useState(
    deal.assumed_liabilities_text ?? ""
  );

  const [excludedLiabilitiesText, setExcludedLiabilitiesText] = useState(
    deal.excluded_liabilities_text ?? ""
  );

  const [promissoryInterestRate, setPromissoryInterestRate] = useState(
    numberToInput(deal.promissory_interest_rate)
  );

  const [promissoryTermMonths, setPromissoryTermMonths] = useState(
    numberToInput(deal.promissory_term_months)
  );

  const [promissoryFirstPaymentDate, setPromissoryFirstPaymentDate] = useState(
    normalizeDate(deal.promissory_first_payment_date)
  );

  const [promissoryMaturityDate, setPromissoryMaturityDate] = useState(
    normalizeDate(deal.promissory_maturity_date)
  );

  const [nonCompeteRestrictedBusiness, setNonCompeteRestrictedBusiness] = useState(
    deal.non_compete_restricted_business ?? ""
  );

  const [nonCompeteTerritory, setNonCompeteTerritory] = useState(
    deal.non_compete_territory ?? ""
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState<string | null>(null);  
  const [previewRefreshKey, setPreviewRefreshKey] = useState(0);

  const [escrowAgentName, setEscrowAgentName] = useState(
    deal.escrow_agent_name ?? ""
  );

  const [escrowAgentAddress, setEscrowAgentAddress] = useState(
    deal.escrow_agent_address ?? ""
  );

  const [escrowDepositAmount, setEscrowDepositAmount] = useState(
    numberToInput(deal.escrow_deposit_amount)
  );

  const [escrowReleaseCondition, setEscrowReleaseCondition] = useState(
    deal.escrow_release_condition ??
      "Upon satisfaction of all closing conditions and delivery of signed closing documents."
  );

  const [leaseAssignmentRequired, setLeaseAssignmentRequired] = useState(
    !!deal.lease_assignment_required
  );

  const [landlordConsentRequired, setLandlordConsentRequired] = useState(
    !!deal.landlord_consent_required
  );

  const [leaseAssignmentCondition, setLeaseAssignmentCondition] = useState(
    deal.lease_assignment_condition ??
      "This Agreement is expressly conditioned upon Buyer obtaining written landlord consent to the assignment or transfer of the premises lease before Closing."
  );

  const [dueDiligencePeriodDays, setDueDiligencePeriodDays] = useState(
    deal.due_diligence_period_days != null
      ? String(deal.due_diligence_period_days)
      : ""
  );

  const [dueDiligenceItemsText, setDueDiligenceItemsText] = useState(
    deal.due_diligence_items_text ??
      "POS sales records\nBank deposit records\nTax returns\nUtility bills\nPayroll records\nVendor invoices"
  );

  const [dueDiligenceCondition, setDueDiligenceCondition] = useState(
    deal.due_diligence_condition ??
      "Buyer shall have the right to review Seller's business records and verify reported sales, expenses, and operational information during the due diligence period before Closing."
  );

  useEffect(() => {
    const nextFirstPaymentDate = getAutoFirstPaymentDate(closingDate);

    setPromissoryFirstPaymentDate(nextFirstPaymentDate);

    const nextMaturityDate = getAutoMaturityDate(
      nextFirstPaymentDate,
      promissoryTermMonths
    );

    setPromissoryMaturityDate(nextMaturityDate);
  }, [closingDate, promissoryTermMonths]);

  const calculatedCashAtClosing = useMemo(() => {
    const pp = parseNumberOrZero(purchasePrice);
    const da = parseNumberOrZero(downPayment);
    const sf = parseNumberOrZero(sellerFinancingAmount);
    return pp - da - sf;
  }, [purchasePrice, downPayment, sellerFinancingAmount]);

  const calculatedAllocationTotal = useMemo(() => {
    const inv = parseNumberOrZero(allocatedInventory);
    const ffe = parseNumberOrZero(allocatedFfe);
    const leasehold = parseNumberOrZero(allocatedLeasehold);
    const customerContracts = parseNumberOrZero(allocatedCustomerContracts);
    const tradeName = parseNumberOrZero(allocatedTradeName);
    const nonCompete = parseNumberOrZero(allocatedNonCompete);
    const goodwill = parseNumberOrZero(allocatedGoodwill);

    return inv + ffe + leasehold + customerContracts + tradeName + nonCompete + goodwill;
  }, [
    allocatedInventory,
    allocatedFfe,
    allocatedLeasehold,
    allocatedCustomerContracts,
    allocatedTradeName,
    allocatedNonCompete,
    allocatedGoodwill,
  ]);

  const allocationDifference = useMemo(() => {
    return calculatedAllocationTotal - parseNumberOrZero(purchasePrice);
  }, [calculatedAllocationTotal, purchasePrice]);

  const allocationStatus = allocationDifference === 0 ? "Balanced" : "Mismatch";

  const allocationCompletion = useMemo(() => {
    const pp = parseNumberOrZero(purchasePrice);
    if (pp <= 0) return 0;
    return Math.round((calculatedAllocationTotal / pp) * 1000) / 10;
  }, [calculatedAllocationTotal, purchasePrice]);

  const percentOfPurchasePrice = (value: string) => {
    const pp = parseNumberOrZero(purchasePrice);
    if (pp <= 0) return "0.0%";
    return `${((parseNumberOrZero(value) / pp) * 100).toFixed(1)}%`;
  };

  const allocationRows = [
    { label: "Inventory", value: allocatedInventory, setter: setAllocatedInventory, placeholder: "75000" },
    { label: "Furniture, Fixtures & Equipment", value: allocatedFfe, setter: setAllocatedFfe, placeholder: "850000" },
    { label: "Leasehold Interest", value: allocatedLeasehold, setter: setAllocatedLeasehold, placeholder: "250000" },
    { label: "Customer Contracts", value: allocatedCustomerContracts, setter: setAllocatedCustomerContracts, placeholder: "300000" },
    { label: "Trade Name / Website / Phone Numbers", value: allocatedTradeName, setter: setAllocatedTradeName, placeholder: "100000" },
    { label: "Non-Compete Covenant", value: allocatedNonCompete, setter: setAllocatedNonCompete, placeholder: "125000" },
    { label: "Goodwill / Going Concern Value", value: allocatedGoodwill, setter: setAllocatedGoodwill, placeholder: "800000" },
  ];

  const includedAssetsLower = includedAssetsText.toLowerCase();
  const hasIncludedAssetKeyword = (keywords: string[]) =>
    keywords.some((keyword) => includedAssetsLower.includes(keyword));

  const riskItems = [
    allocationDifference !== 0
      ? {
          level: "HIGH",
          message: "Allocation total does not equal purchase price.",
          fix: "Adjust allocation categories or use Auto Balance to align the total.",
        }
      : null,
    hasIncludedAssetKeyword(["inventory"]) && parseNumberOrZero(allocatedInventory) <= 0
      ? {
          level: "MEDIUM",
          message: "Inventory is included but no allocation amount was entered.",
          fix: "Enter an allocated inventory amount.",
        }
      : null,
    hasIncludedAssetKeyword(["equipment", "fixture", "fixtures", "furniture", "pos"]) &&
    parseNumberOrZero(allocatedFfe) <= 0
      ? {
          level: "MEDIUM",
          message: "Equipment is included but FFE allocation is missing.",
          fix: "Enter an allocated FFE amount.",
        }
      : null,
    hasIncludedAssetKeyword(["contract", "contracts"]) &&
    parseNumberOrZero(allocatedCustomerContracts) <= 0
      ? {
          level: "MEDIUM",
          message: "Customer contracts are included but not allocated.",
          fix: "Enter an allocated customer contracts amount.",
        }
      : null,
    hasIncludedAssetKeyword(["trade name", "brand", "website", "phone", "logo"]) &&
    parseNumberOrZero(allocatedTradeName) <= 0
      ? {
          level: "MEDIUM",
          message: "Intangible assets are included but no trade name allocation was entered.",
          fix: "Enter a trade name / website / phone number allocation amount.",
        }
      : null,
    (parseNumberOrZero(nonCompeteYears) > 0 || parseNumberOrZero(nonCompeteMiles) > 0) &&
    parseNumberOrZero(allocatedNonCompete) <= 0
      ? {
          level: "MEDIUM",
          message: "Non-compete agreement exists but allocation is missing.",
          fix: "Enter an allocated non-compete covenant amount.",
        }
      : null,
    hasIncludedAssetKeyword(["goodwill", "going concern"]) && parseNumberOrZero(allocatedGoodwill) <= 0
      ? {
          level: "LOW",
          message: "Goodwill is included but goodwill allocation is missing.",
          fix: "Enter a goodwill / going concern value allocation.",
        }
      : null,
  ].filter(Boolean) as {
    level: "HIGH" | "MEDIUM" | "LOW";
    message: string;
    fix: string;
  }[];

  const dealScore = useMemo(() => {
    let score = 0;

    if (businessName.trim()) score += 10;
    if (parseNumberOrZero(purchasePrice) > 0) score += 10;
    if (sellerName.trim() && buyerName.trim()) score += 10;
    if (agreementDate && closingDate) score += 10;
    if (includedAssetsText.trim()) score += 10;
    if (allocationDifference === 0 && parseNumberOrZero(purchasePrice) > 0) score += 25;
    if (parseNumberOrZero(allocatedNonCompete) > 0) score += 10;
    if (equipmentItemsText.trim()) score += 10;
    if (riskItems.length === 0) score += 15;

    return Math.min(score, 100);
  }, [
    businessName,
    purchasePrice,
    sellerName,
    buyerName,
    agreementDate,
    closingDate,
    includedAssetsText,
    allocationDifference,
    allocatedNonCompete,
    equipmentItemsText,
    riskItems.length,
  ]);

  const scoreLabel =
    dealScore >= 85 ? "Ready" : dealScore >= 70 ? "Needs Review" : "High Risk";

  const scoreBarColor =
    dealScore >= 85
      ? "bg-emerald-500"
      : dealScore >= 70
      ? "bg-amber-500"
      : "bg-red-500";

  const currentFormSnapshot = useMemo(
    () =>
      JSON.stringify({
        business_name: canEditLockedCreationFields ? businessName.trim() : null,
        purchase_price: canEditLockedCreationFields ? purchasePrice : null,
        down_payment: canEditLockedCreationFields ? downPayment : null,

        business_type: businessType.trim(),
        business_location: businessLocation.trim(),
        closing_method: closingMethod.trim(),
        seller_financing: sellerFinancing,

        seller_name: sellerName.trim(),
        seller_address: sellerAddress.trim(),
        seller_state_of_organization: sellerStateOfOrganization.trim(),
        seller_ein: sellerEin.trim(),

        buyer_name: buyerName.trim(),
        buyer_address: buyerAddress.trim(),
        buyer_state_of_organization: buyerStateOfOrganization.trim(),

        agreement_date: agreementDate,
        closing_date: closingDate,

        included_assets_text: includedAssetsText.trim(),
        excluded_assets_text: excludedAssetsText.trim(),
        deposit_amount: depositAmount,
        cash_at_closing: cashAtClosing,
        seller_financing_amount: sellerFinancingAmount,
        seller_financing_clause: sellerFinancingClause.trim(),

        allocated_inventory: allocatedInventory,
        allocated_ffe: allocatedFfe,
        allocated_leasehold: allocatedLeasehold,
        allocated_customer_contracts: allocatedCustomerContracts,
        allocated_trade_name: allocatedTradeName,
        allocated_non_compete: allocatedNonCompete,
        allocated_goodwill: allocatedGoodwill,

        state: stateValue.trim(),
        non_compete_years: nonCompeteYears,
        non_compete_miles: nonCompeteMiles,

        equipment_items_text: equipmentItemsText.trim(),
        closing_checklist_text: closingChecklistText.trim(),
        assumed_liabilities_text: assumedLiabilitiesText.trim(),
        excluded_liabilities_text: excludedLiabilitiesText.trim(),

        promissory_interest_rate: promissoryInterestRate,
        promissory_term_months: promissoryTermMonths,
        promissory_first_payment_date: promissoryFirstPaymentDate,
        promissory_maturity_date: promissoryMaturityDate,

        non_compete_restricted_business: nonCompeteRestrictedBusiness.trim(),
        non_compete_territory: nonCompeteTerritory.trim(),

        escrow_agent_name: escrowAgentName.trim(),
        escrow_agent_address: escrowAgentAddress.trim(),
        escrow_deposit_amount: escrowDepositAmount,
        escrow_release_condition: escrowReleaseCondition.trim(),

        lease_assignment_required: leaseAssignmentRequired,
        landlord_consent_required: landlordConsentRequired,
        lease_assignment_condition: leaseAssignmentCondition.trim(),

        due_diligence_period_days: dueDiligencePeriodDays,
        due_diligence_items_text: dueDiligenceItemsText.trim(),
        due_diligence_condition: dueDiligenceCondition.trim(),
      }),
    [
      canEditLockedCreationFields,
      businessName,
      purchasePrice,
      downPayment,
      businessType,
      businessLocation,
      closingMethod,
      sellerFinancing,
      sellerName,
      sellerAddress,
      sellerStateOfOrganization,
      sellerEin,
      buyerName,
      buyerAddress,
      buyerStateOfOrganization,
      agreementDate,
      closingDate,
      includedAssetsText,
      excludedAssetsText,
      depositAmount,
      cashAtClosing,
      sellerFinancingAmount,
      sellerFinancingClause,
      allocatedInventory,
      allocatedFfe,
      allocatedLeasehold,
      allocatedCustomerContracts,
      allocatedTradeName,
      allocatedNonCompete,
      allocatedGoodwill,
      stateValue,
      nonCompeteYears,
      nonCompeteMiles,
      equipmentItemsText,
      closingChecklistText,
      assumedLiabilitiesText,
      excludedLiabilitiesText,
      promissoryInterestRate,
      promissoryTermMonths,
      promissoryFirstPaymentDate,
      promissoryMaturityDate,
      nonCompeteRestrictedBusiness,
      nonCompeteTerritory,
      escrowAgentName,
      escrowAgentAddress,
      escrowDepositAmount,
      escrowReleaseCondition,
      leaseAssignmentRequired,
      landlordConsentRequired,
      leaseAssignmentCondition,
      dueDiligencePeriodDays,
      dueDiligenceItemsText,
      dueDiligenceCondition,
    ]
  );

  useEffect(() => {
    if (lastSavedSnapshot === null) {
      setLastSavedSnapshot(currentFormSnapshot);
    }
  }, [currentFormSnapshot, lastSavedSnapshot]);

  const hasUnsavedChanges =
  lastSavedSnapshot !== null && currentFormSnapshot !== lastSavedSnapshot;

  useEffect(() => {
    if (hasUnsavedChanges && successMessage) {
      setSuccessMessage("");
    }
  }, [hasUnsavedChanges, successMessage]);

  function handleAutoBalanceAllocation() {
    const pp = parseNumberOrZero(purchasePrice);
    const inv = parseNumberOrZero(allocatedInventory);
    const ffe = parseNumberOrZero(allocatedFfe);
    const leasehold = parseNumberOrZero(allocatedLeasehold);
    const customerContracts = parseNumberOrZero(allocatedCustomerContracts);
    const tradeName = parseNumberOrZero(allocatedTradeName);
    const nonCompete = parseNumberOrZero(allocatedNonCompete);

    const newGoodwill = pp - inv - ffe - leasehold - customerContracts - tradeName - nonCompete;
    setAllocatedGoodwill(String(newGoodwill));
  }

  const canSave = useMemo(() => {
    return !saving && canSaveDealDetails && hasUnsavedChanges;
  }, [saving, canSaveDealDetails, hasUnsavedChanges]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isSingleDealExpired) {
      setError(
        "This Single Deal Package access period has expired. Upgrade to Broker Launch Plan to continue editing or regenerating documents."
      );
      return;
    }

    setSaving(true);
    setError("");
    setSuccessMessage("");

    const submitBody = {
      ...(canEditLockedCreationFields
        ? {
            business_name: businessName.trim(),
            purchase_price: purchasePrice !== "" ? Number(purchasePrice) : null,
            down_payment: downPayment !== "" ? Number(downPayment) : null,
          }
        : {}),

      business_type: businessType.trim() !== "" ? businessType.trim() : null,
      business_location:
        businessLocation.trim() !== "" ? businessLocation.trim() : null,
      closing_method: closingMethod.trim() !== "" ? closingMethod.trim() : null,
      seller_financing: sellerFinancing,

      seller_name: sellerName.trim() !== "" ? sellerName.trim() : null,
      seller_address: sellerAddress.trim() !== "" ? sellerAddress.trim() : null,

      seller_state_of_organization:
        sellerStateOfOrganization.trim() !== ""
          ? sellerStateOfOrganization.trim()
          : null,
      seller_ein: sellerEin.trim() !== "" ? sellerEin.trim() : null,

      buyer_name: buyerName.trim() !== "" ? buyerName.trim() : null,
      buyer_address: buyerAddress.trim() !== "" ? buyerAddress.trim() : null,

      buyer_state_of_organization:
        buyerStateOfOrganization.trim() !== ""
          ? buyerStateOfOrganization.trim()
          : null,
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
      allocated_leasehold:
        allocatedLeasehold !== "" ? Number(allocatedLeasehold) : null,
      allocated_customer_contracts:
        allocatedCustomerContracts !== "" ? Number(allocatedCustomerContracts) : null,
      allocated_trade_name:
        allocatedTradeName !== "" ? Number(allocatedTradeName) : null,
      allocated_non_compete:
        allocatedNonCompete !== "" ? Number(allocatedNonCompete) : null,
      allocated_goodwill:
        allocatedGoodwill !== "" ? Number(allocatedGoodwill) : null,
      allocation_total: calculatedAllocationTotal,
      state: stateValue.trim() !== "" ? stateValue.trim() : null,
      non_compete_years:
        nonCompeteYears !== "" ? Number(nonCompeteYears) : null,
      non_compete_miles:
        nonCompeteMiles !== "" ? Number(nonCompeteMiles) : null,

      equipment_items_text:
        equipmentItemsText.trim() !== "" ? equipmentItemsText.trim() : null,
      closing_checklist_text:
        closingChecklistText.trim() !== "" ? closingChecklistText.trim() : null,
    
      assumed_liabilities_text:
        assumedLiabilitiesText.trim() !== "" ? assumedLiabilitiesText.trim() : null,

      excluded_liabilities_text:
        excludedLiabilitiesText.trim() !== "" ? excludedLiabilitiesText.trim() : null,

      promissory_interest_rate:
        promissoryInterestRate !== "" ? Number(promissoryInterestRate) : null,

      promissory_term_months:
        promissoryTermMonths !== "" ? Number(promissoryTermMonths) : null,

      promissory_first_payment_date:
        promissoryFirstPaymentDate.trim() !== "" ? promissoryFirstPaymentDate : null,

      promissory_maturity_date:
        promissoryMaturityDate.trim() !== "" ? promissoryMaturityDate : null,

      non_compete_restricted_business:
        nonCompeteRestrictedBusiness.trim() !== ""
          ? nonCompeteRestrictedBusiness.trim()
          : null,

      non_compete_territory:
        nonCompeteTerritory.trim() !== "" ? nonCompeteTerritory.trim() : null,
        escrow_agent_name:
          escrowAgentName.trim() !== "" ? escrowAgentName.trim() : null,
        escrow_agent_address:
          escrowAgentAddress.trim() !== "" ? escrowAgentAddress.trim() : null,
        escrow_deposit_amount:
          escrowDepositAmount !== "" ? Number(escrowDepositAmount) : null,
        escrow_release_condition:
          escrowReleaseCondition.trim() !== "" ? escrowReleaseCondition.trim() : null,

        lease_assignment_required: leaseAssignmentRequired,
        landlord_consent_required: landlordConsentRequired,
        lease_assignment_condition:
          leaseAssignmentCondition.trim() !== "" ? leaseAssignmentCondition.trim() : null,

        due_diligence_period_days:
          dueDiligencePeriodDays.trim() !== ""
            ? parseNumberOrNull(dueDiligencePeriodDays)
            : null,
        due_diligence_items_text:
          dueDiligenceItemsText.trim() !== "" ? dueDiligenceItemsText.trim() : null,
        due_diligence_condition:
          dueDiligenceCondition.trim() !== "" ? dueDiligenceCondition.trim() : null,

      };

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

      setLastSavedSnapshot(currentFormSnapshot);
      setSuccessMessage("Saved just now.");
      setPreviewRefreshKey((value) => value + 1);

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
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
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

          <WorkspaceNav />
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">
                PactAnchor Deal Intelligence
              </p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                Deal Score: {dealScore}/100
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Status: <span className="font-semibold">{scoreLabel}</span>
              </p>
            </div>

            <div className="w-full md:w-72">
              <div className="mb-2 flex justify-between text-xs text-slate-500">
                <span>Risk</span>
                <span>Closing Ready</span>
              </div>
              <div className="h-3 rounded-full bg-slate-100">
                <div
                  className={`h-3 rounded-full ${scoreBarColor}`}
                  style={{ width: `${dealScore}%` }}
                />
              </div>
            </div>
          </div>

          {riskItems.length > 0 ? (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-bold text-red-800">Risk Alerts</p>

              <div className="mt-3 space-y-3">
                {riskItems.map((risk, index) => (
                  <div key={index} className="rounded-lg bg-white p-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          risk.level === "HIGH"
                            ? "rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-700"
                            : risk.level === "MEDIUM"
                            ? "rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-700"
                            : "rounded-full bg-blue-100 px-2 py-1 text-xs font-bold text-blue-700"
                        }
                      >
                        {risk.level}
                      </span>
                      <span className="font-semibold text-slate-900">
                        {risk.message}
                      </span>
                    </div>

                    <p className="mt-2 text-slate-600">
                      Recommended Action: {risk.fix}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-bold text-emerald-800">
                No major deal risks detected.
              </p>
              <p className="mt-1 text-sm text-emerald-700">
                This deal appears ready for document generation.
              </p>
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="grid gap-8">
            {isSandboxDeal && !canExportDocuments && (
              <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-slate-700">
                <p className="font-semibold text-slate-950">
                  Free Workspace mode
                </p>
                <p className="mt-1">
                  You can enter deal information, save changes, review Document Readiness,
                  and preview how your saved terms appear in the APA for free.
                </p>

                <p className="mt-2">
                  Final document generation and download require a Single Deal Package or
                  Broker Launch Plan.
                </p>
              </div>
            )}

            {isSingleDealPlan && (
              <div
                className={
                  isSingleDealExpired
                    ? "rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm leading-6 text-red-800"
                    : "rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-slate-700"
                }
              >
                <p className="text-base font-semibold">
                  {isSingleDealExpired
                    ? "Single Deal Package — access expired"
                    : "Single Deal Package"}
                </p>

                <p className="mt-2">
                  This workspace is for one specific business sale transaction. Business
                  Name, Purchase Price, and Down Payment are locked because they were set
                  at deal creation.
                </p>

                <p className="mt-2">
                  You can continue completing buyer/seller details, assets, payment terms,
                  non-compete terms, allocation fields, and regenerate documents during the
                  access period.
                </p>

                <p className="mt-2 font-medium">
                  {isSingleDealExpired
                    ? "This deal is now view-only. Upgrade to Broker Launch Plan to continue editing or regenerating documents."
                    : deal.access_expires_at
                    ? `Days remaining: ${accessDaysRemaining ?? 0}`
                    : "Access is active. This older deal does not yet have a 30-day expiration date assigned."}
                </p>

                {deal.access_expires_at && (
                  <p className="mt-1 text-xs">
                    Access expires on {formatDate(deal.access_expires_at)}.
                  </p>
                )}
              </div>
            )}
            {isBrokerLikePlan && (
              <div className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm leading-6 text-slate-700">
                <p className="text-base font-semibold text-slate-900">
                  {planType === "broker_launch"
                    ? "Broker Launch Plan"
                    : planType === "attorney_workflow"
                    ? "Attorney Workflow Plan"
                    : "Admin Workspace"}
                </p>

                <p className="mt-2">
                  You can create and manage multiple business sale deals. Business Name,
                  Purchase Price, and Down Payment remain editable for your workflow.
                </p>
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-700">
              <p className="text-base font-semibold text-slate-900">Next steps</p>

              <ol className="mt-2 list-decimal space-y-1 pl-5">
                <li>Complete buyer and seller information.</li>
                <li>Add included assets, excluded assets, and equipment details.</li>
                <li>Review payment terms and seller financing terms.</li>
                <li>Complete non-compete, allocation, escrow, lease, and due diligence details.</li>
                <li>Save changes, then generate your document package.</li>
              </ol>
            </div>

            <section className="grid gap-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Core Deal Info</h2>
                {!canEditLockedCreationFields && (
                  <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-slate-700">
                    Business Name, Purchase Price, and Down Payment are locked for Single Deal
                    Package users. Continue completing the remaining intake fields below.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Business Name
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  readOnly={!canEditLockedCreationFields}
                  aria-readonly={!canEditLockedCreationFields}
                  className={
                    canEditLockedCreationFields ? editableFieldClassName : lockedFieldClassName
                  }
                  placeholder="Business name"
                  required={canEditLockedCreationFields}
                />
                {!canEditLockedCreationFields && (
                  <p className="mt-1 text-xs text-slate-500">{lockedFieldHelpText}</p>
                )}
              </div>

              <div className="grid gap-5 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Business Type
                </label>
                <input
                  type="text"
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  placeholder="Laundry and Dry Cleaning Business"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Business Location
                </label>
                <input
                  type="text"
                  value={businessLocation}
                  onChange={(e) => setBusinessLocation(e.target.value)}
                  className={editableFieldClassName}
                  placeholder="Example: 1450 Greenville Avenue, Dallas, TX 75206"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Closing Method
                </label>
                <input
                  type="text"
                  value={closingMethod}
                  onChange={(e) => setClosingMethod(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  placeholder="Wire transfer and signed closing documents"
                />
              </div>
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
                    readOnly={!canEditLockedCreationFields}
                    aria-readonly={!canEditLockedCreationFields}
                    className={
                      canEditLockedCreationFields ? editableFieldClassName : lockedFieldClassName
                    }
                    placeholder="750000"
                  />
                  {!canEditLockedCreationFields && (
                    <p className="mt-1 text-xs text-slate-500">{lockedFieldHelpText}</p>
                  )}
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
                    readOnly={!canEditLockedCreationFields}
                    aria-readonly={!canEditLockedCreationFields}
                    className={
                      canEditLockedCreationFields ? editableFieldClassName : lockedFieldClassName
                    }
                    placeholder="150000"
                  />
                  {!canEditLockedCreationFields && (
                    <p className="mt-1 text-xs text-slate-500">{lockedFieldHelpText}</p>
                  )}
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
                    className={editableFieldClassName}
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
                    className={editableFieldClassName}
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

              <div className="grid gap-5 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Seller State of Organization
                  </label>
                  <input
                    type="text"
                    value={sellerStateOfOrganization}
                    onChange={(e) => setSellerStateOfOrganization(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                    placeholder="Texas"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Buyer State of Organization
                  </label>
                  <input
                    type="text"
                    value={buyerStateOfOrganization}
                    onChange={(e) => setBuyerStateOfOrganization(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                    placeholder="Texas"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Seller EIN
                  </label>
                  <input
                    type="text"
                    value={sellerEin}
                    onChange={(e) => setSellerEin(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                    placeholder="XX-XXXXXXX"
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
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  rows={4}
                  placeholder={`Enter one item per line

                  Commercial washers
                  Dryers
                  Pressing machines
                  Customer waiting-area furniture
                  POS terminals`}
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
                  placeholder={`Enter one item per line

                  Seller cash and bank accounts
                  Accounts receivable before closing
                  Seller tax records
                  Personal vehicles
                  Non-transferable licenses`}
                />
              </div>
            </section>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Assumed Liabilities
                </label>
                <textarea
                  value={assumedLiabilitiesText}
                  onChange={(e) => setAssumedLiabilitiesText(e.target.value)}
                  className="min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  placeholder={`Enter one item per line

                  Equipment lease obligations
                  Customer prepaid orders
                  Assigned service contracts`}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Excluded Liabilities
                </label>
                <textarea
                  value={excludedLiabilitiesText}
                  onChange={(e) => setExcludedLiabilitiesText(e.target.value)}
                  className="min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  placeholder={`Enter one item per line

                  Seller tax liabilities
                  Pending litigation
                  Pre-closing payroll obligations`}
                />
              </div>

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

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Interest Rate (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={promissoryInterestRate}
                    onChange={(e) => setPromissoryInterestRate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                    placeholder="7.5"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Term Months
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={promissoryTermMonths}
                    onChange={(e) => setPromissoryTermMonths(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                    placeholder="60"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    First Payment Date
                  </label>
                  <input
                    type="text"
                    value={promissoryFirstPaymentDate}
                    readOnly
                    tabIndex={-1}
                    className="w-full cursor-not-allowed rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-600 outline-none"
                    placeholder="Auto-calculated"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Auto-calculated from Closing Date.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Maturity Date
                  </label>
                  <input
                    type="text"
                    value={promissoryMaturityDate}
                    readOnly
                    tabIndex={-1}
                    className="w-full cursor-not-allowed rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-600 outline-none"
                    placeholder="Auto-calculated"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Auto-calculated from Term Months and First Payment Date.
                  </p>
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
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Purchase Price Allocation</h2>
                <p className="mt-2 border-l-4 border-slate-200 pl-4 text-sm leading-6 text-slate-600">
                  Allocate the total purchase price across transferred asset categories.
                  PactAnchor will use this schedule for the APA, allocation statement,
                  non-compete sync, and readiness checks.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-5">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Purchase Price</p>
                  <p className="mt-2 text-lg font-bold text-slate-900">
                    {formatCurrencyPreview(parseNumberOrNull(purchasePrice))}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Allocation Total</p>
                  <p className="mt-2 text-lg font-bold text-slate-900">
                    {formatCurrencyPreview(calculatedAllocationTotal)}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Difference</p>
                  <p className={allocationDifference === 0 ? "mt-2 text-lg font-bold text-emerald-700" : "mt-2 text-lg font-bold text-red-700"}>
                    {formatCurrencyPreview(allocationDifference)}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Completion</p>
                  <p className="mt-2 text-lg font-bold text-slate-900">{allocationCompletion}%</p>
                </div>
                <div className={allocationStatus === "Balanced" ? "rounded-xl border border-emerald-200 bg-emerald-50 p-4" : "rounded-xl border border-red-200 bg-red-50 p-4"}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</p>
                  <p className={allocationStatus === "Balanced" ? "mt-2 text-lg font-bold text-emerald-700" : "mt-2 text-lg font-bold text-red-700"}>
                    {allocationStatus}
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="grid grid-cols-[1.5fr_1fr_1fr] border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <div>Category</div>
                  <div>Amount</div>
                  <div>% of Purchase Price</div>
                </div>

                {allocationRows.map((row) => (
                  <div
                    key={row.label}
                    className="grid grid-cols-[1.5fr_1fr_1fr] items-center gap-4 border-b border-slate-100 px-4 py-3 last:border-b-0"
                  >
                    <label className="text-sm font-medium text-slate-700">{row.label}</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={row.value}
                      onChange={(e) => row.setter(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                      placeholder={row.placeholder}
                    />
                    <div className="text-sm font-semibold text-slate-700">
                      {percentOfPurchasePrice(row.value)}
                    </div>
                  </div>
                ))}

                <div className="grid grid-cols-[1.5fr_1fr_1fr] items-center gap-4 bg-slate-50 px-4 py-3">
                  <p className="text-sm font-bold text-slate-900">Total</p>
                  <p className="text-sm font-bold text-slate-900">
                    {formatCurrencyPreview(calculatedAllocationTotal)}
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {allocationCompletion}%
                  </p>
                </div>
              </div>

              {allocationStatus === "Mismatch" ? (
                <div className="rounded-xl border border-red-300 bg-red-50 p-4">
                  <p className="text-sm font-semibold text-red-800">
                    Allocation total does not equal purchase price.
                  </p>
                  <p className="mt-1 text-sm text-red-700">
                    Difference: <span className="font-semibold">{formatCurrencyPreview(allocationDifference)}</span>
                  </p>
                  <button
                    type="button"
                    onClick={handleAutoBalanceAllocation}
                    className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                  >
                    Auto Balance Goodwill
                  </button>
                </div>
              ) : (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-sm font-semibold text-emerald-800">
                    Balanced: allocation equals purchase price.
                  </p>
                </div>
              )}

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Professional Review Note</p>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  Allocation support is provided for document preparation and professional review.
                  Final tax classification should be reviewed by a CPA or tax advisor.
                </p>
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

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Restricted Business
                  </label>
                  <textarea
                    value={nonCompeteRestrictedBusiness}
                    onChange={(e) => setNonCompeteRestrictedBusiness(e.target.value)}
                    className="min-h-20 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                
                    placeholder={`Enter one item per line

                    Laundry
                    dry cleaning
                    wash-and-fold 
                    commercial laundry services`}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Restricted Territory
                  </label>
                  <textarea
                    value={nonCompeteTerritory}
                    onChange={(e) => setNonCompeteTerritory(e.target.value)}
                    className="min-h-20 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                    placeholder="25-mile radius from 1450 Greenville Avenue, Dallas, TX 75206"
                  />
                </div>

              </div>
            </section>

            <section className="grid gap-5">
              <h2 className="text-lg font-semibold text-slate-900">
                Escrow, Lease Assignment & Due Diligence
              </h2>

              <div className="grid gap-5 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Escrow Agent Name
                  </label>
                  <input
                    type="text"
                    value={escrowAgentName}
                    onChange={(e) => setEscrowAgentName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                    placeholder="Dallas Title & Escrow LLC"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Escrow Agent Address
                  </label>
                  <input
                    type="text"
                    value={escrowAgentAddress}
                    onChange={(e) => setEscrowAgentAddress(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                    placeholder="123 Main Street, Dallas, TX"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Escrow Deposit Amount
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={escrowDepositAmount}
                    onChange={(e) => setEscrowDepositAmount(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                    placeholder="10000"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Escrow Release Condition
                </label>
                <textarea
                  value={escrowReleaseCondition}
                  onChange={(e) => setEscrowReleaseCondition(e.target.value)}
                  className="min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="inline-flex items-center gap-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={leaseAssignmentRequired}
                    onChange={(e) => setLeaseAssignmentRequired(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Lease Assignment Required
                </label>

                <label className="inline-flex items-center gap-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={landlordConsentRequired}
                    onChange={(e) => setLandlordConsentRequired(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Landlord Consent Required
                </label>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Lease Assignment Condition
                </label>
                <textarea
                  value={leaseAssignmentCondition}
                  onChange={(e) => setLeaseAssignmentCondition(e.target.value)}
                  className="min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Due Diligence Period Days
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={dueDiligencePeriodDays}
                  onChange={(e) => {
                    const value = e.target.value;
                    setDueDiligencePeriodDays(value);
                  }}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  placeholder="14"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Due Diligence Items
                </label>
                <textarea
                  value={dueDiligenceItemsText}
                  onChange={(e) => setDueDiligenceItemsText(e.target.value)}
                  className="min-h-28 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  placeholder={`POS sales records
Bank deposit records
Tax returns
Utility bills
Payroll records
Vendor invoices`}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Due Diligence Condition
                </label>
                <textarea
                  value={dueDiligenceCondition}
                  onChange={(e) => setDueDiligenceCondition(e.target.value)}
                  className="min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                />
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
                  placeholder={`Enter one item per line using this format:

                  Commercial Washer #1 | W-1001 | Good
                  Commercial Dryer #1 | D-2001 | Good
                  Pressing Machine | P-3001 | Fair
                  POS Terminal | POS-223 | Excellent`}
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
                  placeholder={`Enter one item per line

                  Asset Purchase Agreement executed
                  Bill of Sale executed
                  Promissory Note executed
                  Non-Compete Agreement executed
                  Closing funds delivered
                  Lease assignment delivered
                  Landlord consent delivered
                  Equipment schedule attached
                  IRS allocation reviewed`}
                />
              </div>
            </section>

            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div
              className={
                hasUnsavedChanges
                  ? "rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
                  : "rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600"
              }
            >
              {saving
                ? "Saving changes..."
                : isSingleDealExpired
                ? "This deal is view-only because the Single Deal access period has expired."
                : hasUnsavedChanges
                ? "Unsaved changes. Save before generating documents."
                : successMessage
                ? successMessage
                : "All changes are saved."}
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={!canSave}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : isSingleDealExpired
                  ? "Access Expired"
                  : hasUnsavedChanges
                  ? "Save Changes"
                  : "Saved"}
              </button>

              <Link
                href={isSandboxDeal ? "/dashboard" : "/deals"}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </Link>
            </div>
          </div>
        </form>

        <LiveDocumentPreviewPanel
          dealId={deal.id}
          refreshKey={previewRefreshKey}
          isSandboxDeal={isSandboxDeal}
          canExportDocuments={canExportDocuments}
        />

        <DocumentGeneratorPanel
          dealId={deal.id}
          isSingleDealExpired={isSingleDealExpired}
          planType={planType}
          isSandboxDeal={isSandboxDeal}
          canExportDocuments={canExportDocuments}
        />
      </div>
    </main>
  );
}