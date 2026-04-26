export type TemplateKey =
  | "asset_purchase_agreement"
  | "bill_of_sale"
  | "promissory_note"
  | "non_compete"
  | "irs_8594";

export type RequirementField = {
  field: string;
  label: string;
  treatZeroAsMissing?: boolean;
};

export const TEMPLATE_REQUIREMENTS: Record<TemplateKey, RequirementField[]> = {
  asset_purchase_agreement: [
    { field: "business_name", label: "Business Name" },
    { field: "seller_name", label: "Seller Name" },
    { field: "buyer_name", label: "Buyer Name" },
    { field: "agreement_date", label: "Agreement Date" },
    { field: "closing_date", label: "Closing Date" },
    { field: "purchase_price", label: "Purchase Price" },
    { field: "state", label: "State" },
  ],
  bill_of_sale: [
    { field: "business_name", label: "Business Name" },
    { field: "seller_name", label: "Seller Name" },
    { field: "buyer_name", label: "Buyer Name" },
    { field: "seller_address", label: "Seller Address" },
    { field: "buyer_address", label: "Buyer Address" },
    { field: "closing_date", label: "Closing Date" },
    { field: "purchase_price", label: "Purchase Price" },
    { field: "state", label: "State" },
  ],
  promissory_note: [
    { field: "business_name", label: "Business Name" },
    { field: "seller_name", label: "Lender / Seller Name" },
    { field: "buyer_name", label: "Borrower / Buyer Name" },
    { field: "state", label: "State" },
    { field: "seller_financing_amount", label: "Seller Financing Amount" },
    { field: "closing_date", label: "Issue Date / Closing Date" },
  ],
  non_compete: [
    { field: "business_name", label: "Business Name" },
    { field: "seller_name", label: "Restricted Party / Seller Name" },
    { field: "buyer_name", label: "Protected Party / Buyer Name" },
    { field: "closing_date", label: "Closing Date" },
    { field: "state", label: "State" },
    {
      field: "non_compete_years",
      label: "Non-Compete Years",
      treatZeroAsMissing: true,
    },
    {
      field: "non_compete_miles",
      label: "Non-Compete Miles",
      treatZeroAsMissing: true,
    },
  ],
  irs_8594: [
    { field: "business_name", label: "Business Name" },
    { field: "seller_name", label: "Seller Name" },
    { field: "buyer_name", label: "Buyer Name" },
    { field: "closing_date", label: "Closing Date" },
    { field: "purchase_price", label: "Purchase Price", treatZeroAsMissing: true },
    { field: "allocated_inventory", label: "Allocated Inventory" },
    { field: "allocated_ffe", label: "Allocated FFE" },
    {
      field: "allocated_non_compete",
      label: "Allocated Non-Compete",
      treatZeroAsMissing: true,
    },
    { field: "allocated_goodwill", label: "Allocated Goodwill" },
  ],
};

function isMissingValue(value: unknown, treatZeroAsMissing = false) {
  if (value === null || value === undefined) return true;

  if (typeof value === "string") {
    return value.trim() === "";
  }

  if (typeof value === "number") {
    if (Number.isNaN(value)) return true;
    if (treatZeroAsMissing && value <= 0) return true;
    return false;
  }

  return false;
}

export function validateTemplateData(
  templateKey: TemplateKey,
  data: Record<string, unknown>
) {
  const requirements = TEMPLATE_REQUIREMENTS[templateKey] ?? [];

  const missingFields = requirements.filter((item) =>
    isMissingValue(data[item.field], item.treatZeroAsMissing)
  );

  return {
    template_key: templateKey,
    missing_fields: missingFields,
    is_ready: missingFields.length === 0,
  };
}