export type ApaPreviewSection = {
  heading: string;
  body: string;
  locked?: boolean;
};

export type ApaPreviewResponse = {
  documentType: "asset_purchase_agreement";
  title: string;
  subtitle: string;
  previewMode: "redacted";
  generatedFrom: "saved_deal_terms";
  sections: ApaPreviewSection[];
  lockedMessage: string;
};

export type DealPreviewSource = {
  business_name?: string | null;
  purchase_price?: number | null;
  down_payment?: number | null;
  seller_financing?: boolean | null;

  seller_name?: string | null;
  buyer_name?: string | null;
  seller_address?: string | null;
  buyer_address?: string | null;

  agreement_date?: string | null;
  closing_date?: string | null;

  included_assets?: string | null;
  excluded_assets?: string | null;
  included_assets_text?: string | null;
  excluded_assets_text?: string | null;

  cash_at_closing?: number | null;
  seller_financing_amount?: number | null;
  promissory_note_amount?: number | null;

  non_compete_years?: number | null;
  non_compete_miles?: number | null;
  business_address?: string | null;
};

function valueOrPlaceholder(value: string | number | null | undefined, placeholder: string) {
  if (value === null || value === undefined) {
    return placeholder;
  }

  const text = String(value).trim();

  return text.length > 0 ? text : placeholder;
}

function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "[Not provided]";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "[Not provided]";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(parsed);
}

function truncateText(value: string | null | undefined, maxLength = 420) {
  const text = valueOrPlaceholder(value, "[Not provided]");

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trim()}...`;
}

function buildSellerFinancingSummary(deal: DealPreviewSource) {
  if (!deal.seller_financing) {
    return "Seller financing is not marked as part of the saved transaction terms.";
  }

  const financingAmount =
    deal.seller_financing_amount ?? deal.promissory_note_amount ?? null;

  return [
    "Seller financing is marked as part of the saved transaction terms.",
    `Seller financing amount: ${formatCurrency(financingAmount)}`,
    "The full promissory note terms and repayment provisions are included in the locked draft package.",
  ].join("\n");
}

function buildNonCompeteSummary(deal: DealPreviewSource) {
  const years = deal.non_compete_years;
  const miles = deal.non_compete_miles;

  if (!years && !miles) {
    return "Non-compete terms have not been fully provided in the saved transaction terms.";
  }

  return [
    `Restricted period: ${years ? `${years} year(s)` : "[Not provided]"}`,
    `Restricted area: ${miles ? `${miles} mile(s)` : "[Not provided]"}`,
    `Business address reference: ${valueOrPlaceholder(
      deal.business_address,
      "[Business address not provided]"
    )}`,
    "The complete non-compete covenant language is included in the locked draft package.",
  ].join("\n");
}

export function buildApaPreview(deal: DealPreviewSource): ApaPreviewResponse {
  const businessName = valueOrPlaceholder(deal.business_name, "[Business Name]");
  const sellerName = valueOrPlaceholder(deal.seller_name, "[Seller Name]");
  const buyerName = valueOrPlaceholder(deal.buyer_name, "[Buyer Name]");

  return {
    documentType: "asset_purchase_agreement",
    title: "Asset Purchase Agreement",
    subtitle:
      "Live preview generated from your saved deal terms. Full clauses and export-ready documents unlock after upgrade.",
    previewMode: "redacted",
    generatedFrom: "saved_deal_terms",
    sections: [
      {
        heading: "Agreement Header",
        body: [
          "ASSET PURCHASE AGREEMENT",
          `Dated as of: ${formatDate(deal.agreement_date)}`,
          `Business: ${businessName}`,
        ].join("\n"),
      },
      {
        heading: "Parties",
        body: [
          `Seller: ${sellerName}`,
          `Seller Address: ${valueOrPlaceholder(
            deal.seller_address,
            "[Seller Address]"
          )}`,
          "",
          `Buyer: ${buyerName}`,
          `Buyer Address: ${valueOrPlaceholder(
            deal.buyer_address,
            "[Buyer Address]"
          )}`,
        ].join("\n"),
      },
      {
        heading: "Transaction Overview",
        body: [
          `This preview reflects the proposed asset purchase transaction for ${businessName}.`,
          `Closing Date: ${formatDate(deal.closing_date)}`,
          "The full agreement will include closing conditions, delivery obligations, schedules, and additional legal provisions in the final draft package.",
        ].join("\n"),
      },
      {
        heading: "Purchase Price",
        body: [
          `Purchase Price: ${formatCurrency(deal.purchase_price)}`,
          `Down Payment: ${formatCurrency(deal.down_payment)}`,
          `Cash at Closing: ${formatCurrency(deal.cash_at_closing)}`,
        ].join("\n"),
      },
      {
        heading: "Included Assets Preview",
        body: truncateText(deal.included_assets_text ?? deal.included_assets, 420),
      },
      {
        heading: "Excluded Assets Preview",
        body: truncateText(deal.excluded_assets_text ?? deal.excluded_assets, 280),
      },
      {
        heading: "Seller Financing Summary",
        body: buildSellerFinancingSummary(deal),
      },
      {
        heading: "Non-Compete Summary",
        body: buildNonCompeteSummary(deal),
      },
      {
        heading: "Locked Full Draft Package",
        body: [
          "Full APA clauses, schedules, representations, warranties, closing conditions, covenants, and export-ready legal provisions are locked.",
          "Upgrade to generate and download the complete attorney-review-ready draft package.",
        ].join("\n"),
        locked: true,
      },
    ],
    lockedMessage:
      "This is a redacted live preview. Full document generation, download, and package export are available after upgrade.",
  };
}