import { Deal, GeneratedDocument } from "@/lib/types/deal";
import { formatDocumentFilename } from "@/lib/contracts/build-documents";

type DocumentTemplateKey =
  | "asset_purchase_agreement"
  | "promissory_note"
  | "bill_of_sale"
  | "non_compete_agreement"
  | "equipment_list"
  | "closing_checklist"
  | "generic_document";

export type DocumentPreviewPayload = {
  templateKey: DocumentTemplateKey;
  documentName: string;
  outputFilename: string;
  generatedAt: string;
  dealId: string;
  businessName: string;
  data: Record<string, unknown>;
};

export function buildDocumentPayloadForDeal(
  deal: Deal,
  doc: GeneratedDocument
): DocumentPreviewPayload {
  const templateKey = inferTemplateKey(doc.name);

  const shared = buildSharedFields(deal);
  const cleanedEquipmentItems = cleanEquipmentItems(deal);
  const cleanedChecklistItems = cleanChecklistItems(deal);

  switch (templateKey) {
    case "asset_purchase_agreement":
      return {
        templateKey,
        documentName: doc.name,
        outputFilename: ensureDocxFilename(doc),
        generatedAt: new Date().toISOString(),
        dealId: deal.id,
        businessName: deal.businessName,
        data: {
          ...shared,
          agreement_title: "Asset Purchase Agreement",
          included_assets: splitBulletishText(deal.includedAssetsText),
          excluded_assets: splitBulletishText(deal.excludedAssetsText),
          allocation: {
            inventory: deal.allocatedInventory,
            furniture_fixtures_equipment: deal.allocatedFFE,
            goodwill: deal.allocatedGoodwill,
          },
          deposit_amount: deal.depositAmount,
          seller_financing_enabled: deal.sellerFinancingEnabled,
          seller_financing_amount: deal.sellerFinancingAmount,
          equipment_items: cleanedEquipmentItems.map((item, index) => ({
            line_no: index + 1,
            name: item.name,
            quantity: item.quantity,
            notes: item.notes,
          })),
          closing_checklist_items: cleanedChecklistItems.map((item, index) => ({
            line_no: index + 1,
            label: item.label,
            completed: item.completed,
          })),
        },
      };

    case "promissory_note":
      return {
        templateKey,
        documentName: doc.name,
        outputFilename: ensureDocxFilename(doc),
        generatedAt: new Date().toISOString(),
        dealId: deal.id,
        businessName: deal.businessName,
        data: {
          ...shared,
          note_title: "Promissory Note",
          principal_amount: deal.sellerFinancingAmount,
          borrower_name: deal.buyerName,
          lender_name: deal.sellerName,
          issue_date: deal.closingDate,
          maturity_note:
            "The final maturity date, amortization schedule, and interest provisions should be inserted in the final execution copy.",
          promise_to_pay_clause:
            "For value received, Borrower unconditionally promises to pay to the order of Lender the principal sum stated in this Note, together with any agreed interest, in lawful money of the United States.",
          payment_terms_clause:
            "Borrower shall make payments in the manner, frequency, and amounts required by the amortization or payment schedule attached to or incorporated into this Note.",
          default_clause:
            "Any failure by Borrower to make a required payment when due, or any other breach of this Note, shall constitute an event of default.",
          acceleration_clause:
            "Upon an event of default, Lender may declare the entire unpaid principal balance, together with accrued interest and any other sums due, immediately due and payable without further notice except as required by applicable law.",
          waiver_clause:
            "No waiver by Lender of any default shall operate as a waiver of any other default or of the same default on a future occasion.",
          attorney_fees_clause:
            "If this Note is placed in the hands of an attorney for collection or enforcement after default, Borrower agrees to pay reasonable attorneys’ fees and enforcement costs to the extent permitted by law.",
          governing_law_clause: `This Note shall be governed by and construed in accordance with the laws of the State of ${deal.state}.`,
        },
      };

    case "bill_of_sale":
      return {
        templateKey,
        documentName: doc.name,
        outputFilename: ensureDocxFilename(doc),
        generatedAt: new Date().toISOString(),
        dealId: deal.id,
        businessName: deal.businessName,
        data: {
          ...shared,
          instrument_title: "Bill of Sale",
          transferred_assets_summary: splitBulletishText(deal.includedAssetsText),
          excluded_assets_summary: splitBulletishText(deal.excludedAssetsText),
          equipment_items: cleanedEquipmentItems.map((item, index) => ({
            line_no: index + 1,
            item_name: item.name,
            quantity: item.quantity,
            notes: item.notes,
          })),
        },
      };

    case "non_compete_agreement":
      return {
        templateKey,
        documentName: doc.name,
        outputFilename: ensureDocxFilename(doc),
        generatedAt: new Date().toISOString(),
        dealId: deal.id,
        businessName: deal.businessName,
        data: {
          ...shared,
          agreement_title: "Non-Compete Agreement",
          restricted_party: deal.sellerName,
          benefited_party: deal.buyerName,
          restricted_business_name: deal.businessName,
          restricted_state: deal.state,
          restricted_term_years: deal.nonCompeteYears,
          restricted_radius_miles: deal.nonCompeteMiles,
          restricted_activities: [
            "owning, operating, managing, or controlling a competing business",
            "soliciting customers, referral sources, or business relationships transferred in the sale",
            "inducing employees or contractors of the acquired business to terminate their relationship",
          ],
          acknowledgement_clause:
            "Restricted Party acknowledges that the restrictions contained in this Agreement are reasonable in scope, duration, and geographic area and are necessary to protect the goodwill, confidential information, and business relationships acquired by Benefited Party.",
          injunctive_relief_clause:
            "Restricted Party acknowledges that any breach of this Agreement may cause irreparable harm for which monetary damages alone may be inadequate, and Benefited Party shall therefore be entitled to seek injunctive or equitable relief in addition to any other remedies available at law or in equity.",
          severability_clause:
            "If any provision of this Agreement is determined to be unenforceable, the remaining provisions shall remain in effect, and any unenforceable provision shall be reformed to the minimum extent necessary to make it enforceable where permitted by law.",
          governing_law_clause: `This Agreement shall be governed by and construed in accordance with the laws of the State of ${deal.state}.`,
        },
      };

    case "equipment_list":
      return {
        templateKey,
        documentName: doc.name,
        outputFilename: ensureDocxFilename(doc),
        generatedAt: new Date().toISOString(),
        dealId: deal.id,
        businessName: deal.businessName,
        data: {
          ...shared,
          schedule_title: "Equipment List",
          items: cleanedEquipmentItems.map((item, index) => ({
            line_no: index + 1,
            item_name: item.name,
            quantity: item.quantity,
            notes: item.notes,
          })),
          total_items: cleanedEquipmentItems.length,
          seller_name: deal.sellerName,
          seller_address: deal.sellerAddress,
          buyer_name: deal.buyerName,
          buyer_address: deal.buyerAddress,
          business_address: deal.sellerAddress,
          additional_equipment: cleanedEquipmentItems
            .map((item) => item.name)
            .filter(Boolean)
            .join(", "),
        },
      };

    case "closing_checklist":
      return {
        templateKey,
        documentName: doc.name,
        outputFilename: ensureDocxFilename(doc),
        generatedAt: new Date().toISOString(),
        dealId: deal.id,
        businessName: deal.businessName,
        data: {
          ...shared,
          checklist_title: "Closing Checklist",
          items: cleanedChecklistItems.map((item, index) => ({
            line_no: index + 1,
            label: item.label,
            completed: item.completed,
          })),
          total_items: cleanedChecklistItems.length,
        },
      };

    default:
      return {
        templateKey: "generic_document",
        documentName: doc.name,
        outputFilename: ensureDocxFilename(doc),
        generatedAt: new Date().toISOString(),
        dealId: deal.id,
        businessName: deal.businessName,
        data: {
          ...shared,
          note: "No dedicated template builder found for this document type.",
        },
      };
  }
}

export function buildAllDocumentPayloads(deal: Deal) {
  return deal.generatedDocuments.map((doc) => buildDocumentPayloadForDeal(deal, doc));
}

function buildSharedFields(deal: Deal) {
  return {
    deal_id: deal.id,
    business_name: deal.businessName,
    state: deal.state,
    deal_type: deal.dealType,

    seller: {
      name: deal.sellerName,
      address: deal.sellerAddress,
    },

    buyer: {
      name: deal.buyerName,
      address: deal.buyerAddress,
    },

    purchase_terms: {
      purchase_price: deal.purchasePrice,
      deposit_amount: deal.depositAmount,
      closing_date: deal.closingDate,
    },

    seller_financing: {
      enabled: deal.sellerFinancingEnabled,
      amount: deal.sellerFinancingAmount,
    },

    allocation: {
      inventory: deal.allocatedInventory,
      furniture_fixtures_equipment: deal.allocatedFFE,
      goodwill: deal.allocatedGoodwill,
    },

    restrictive_covenants: {
      non_compete_years: deal.nonCompeteYears,
      non_compete_miles: deal.nonCompeteMiles,
    },

    metadata: {
      created_at: deal.createdAt,
      updated_at: deal.updatedAt,
    },
  };
}

function inferTemplateKey(name: string): DocumentTemplateKey {
  const normalized = name.toLowerCase();

  if (normalized.includes("asset purchase agreement")) {
    return "asset_purchase_agreement";
  }

  if (normalized.includes("promissory note")) {
    return "promissory_note";
  }

  if (normalized.includes("bill of sale")) {
    return "bill_of_sale";
  }

  if (normalized.includes("non-compete")) {
    return "non_compete_agreement";
  }

  if (normalized.includes("equipment list")) {
    return "equipment_list";
  }

  if (normalized.includes("closing checklist")) {
    return "closing_checklist";
  }

  return "generic_document";
}

function splitBulletishText(input: string): string[] {
  if (!input.trim()) return [];

  return input
    .split(/\n|•|;/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function cleanEquipmentItems(deal: Deal) {
  return deal.equipmentItems.filter(
    (item) => item.name.trim() || item.quantity.trim() || item.notes.trim()
  );
}

function cleanChecklistItems(deal: Deal) {
  return deal.closingChecklistItems.filter((item) => item.label.trim());
}

function ensureDocxFilename(doc: GeneratedDocument) {
  const base = formatDocumentFilename(doc).replace(/\.(pdf|docx)$/i, "");
  return `${base}.docx`;
}