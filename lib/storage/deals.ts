"use client";

import { initialDeals } from "@/lib/mock/deals";
import { buildGeneratedDocuments } from "@/lib/contracts/build-documents";
import {
  ClosingChecklistItem,
  Deal,
  EquipmentItem,
  GeneratedDocument,
} from "@/lib/types/deal";

const STORAGE_KEY = "pactanchor_deals_v1";

function makeDefaultEquipmentItems(): EquipmentItem[] {
  return [
    {
      id: `eq-${Date.now()}-1`,
      name: "",
      quantity: "",
      notes: "",
    },
  ];
}

function makeDefaultClosingChecklistItems(): ClosingChecklistItem[] {
  return [
    {
      id: `cl-${Date.now()}-1`,
      label: "Execute Asset Purchase Agreement",
      completed: false,
    },
    {
      id: `cl-${Date.now()}-2`,
      label: "Deliver Bill of Sale",
      completed: false,
    },
  ];
}

function normalizeDeal(input: Partial<Deal> & { id: string }): Deal {
  return {
    id: input.id,

    businessName: input.businessName ?? "",
    state: input.state ?? "",
    dealType: input.dealType ?? "Asset Purchase",

    sellerName: input.sellerName ?? "",
    sellerAddress: input.sellerAddress ?? "",

    buyerName: input.buyerName ?? "",
    buyerAddress: input.buyerAddress ?? "",

    purchasePrice: input.purchasePrice ?? "",
    depositAmount: input.depositAmount ?? "",
    closingDate: input.closingDate ?? "",

    sellerFinancingEnabled: input.sellerFinancingEnabled ?? false,
    sellerFinancingAmount: input.sellerFinancingAmount ?? "",

    allocatedInventory: input.allocatedInventory ?? "",
    allocatedFFE: input.allocatedFFE ?? "",
    allocatedGoodwill: input.allocatedGoodwill ?? "",

    includedAssetsText: input.includedAssetsText ?? "",
    excludedAssetsText: input.excludedAssetsText ?? "",

    nonCompeteYears: input.nonCompeteYears ?? "",
    nonCompeteMiles: input.nonCompeteMiles ?? "",

    equipmentItems:
      input.equipmentItems && input.equipmentItems.length > 0
        ? input.equipmentItems
        : makeDefaultEquipmentItems(),

    closingChecklistItems:
      input.closingChecklistItems && input.closingChecklistItems.length > 0
        ? input.closingChecklistItems
        : makeDefaultClosingChecklistItems(),

    createdAt: input.createdAt ?? new Date().toISOString(),
    updatedAt: input.updatedAt ?? new Date().toISOString(),

    generatedDocuments:
      input.generatedDocuments ?? buildGeneratedDocuments(input.sellerFinancingEnabled ?? false),
  };
}

function isValidDealArray(value: unknown): value is Deal[] {
  return Array.isArray(value);
}

function seedDeals(): Deal[] {
  const normalized = initialDeals.map((deal) => normalizeDeal(deal));
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  }
  return normalized;
}

export function loadDeals(): Deal[] {
  if (typeof window === "undefined") return initialDeals.map((deal) => normalizeDeal(deal));

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return seedDeals();
  }

  try {
    const parsed = JSON.parse(raw) as unknown;

    if (!isValidDealArray(parsed) || parsed.length === 0) {
      return seedDeals();
    }

    const normalized = parsed.map((deal) =>
      normalizeDeal(deal as Partial<Deal> & { id: string })
    );

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  } catch {
    return seedDeals();
  }
}

export function saveDeals(deals: Deal[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(deals));
}

export function getDealById(id: string): Deal | undefined {
  const deals = loadDeals();
  const found = deals.find((deal) => deal.id === id);

  if (found) return found;

  const fallback = initialDeals.find((deal) => deal.id === id);
  return fallback ? normalizeDeal(fallback) : undefined;
}

export function createDeal(
  input: Omit<Deal, "id" | "createdAt" | "updatedAt" | "generatedDocuments">
): Deal {
  const now = new Date().toISOString();

  const newDeal: Deal = normalizeDeal({
    ...input,
    id: `deal-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
    generatedDocuments: buildGeneratedDocuments(input.sellerFinancingEnabled),
  });

  const deals = loadDeals();
  const nextDeals = [newDeal, ...deals];
  saveDeals(nextDeals);

  return newDeal;
}

export function updateDeal(updatedDeal: Deal): Deal {
  const deals = loadDeals();

  const nextDeal: Deal = normalizeDeal({
    ...updatedDeal,
    updatedAt: new Date().toISOString(),
  });

  const exists = deals.some((deal) => deal.id === updatedDeal.id);

  const nextDeals = exists
    ? deals.map((deal) => (deal.id === updatedDeal.id ? nextDeal : deal))
    : [nextDeal, ...deals];

  saveDeals(nextDeals);
  return nextDeal;
}

export function replaceDealDocuments(
  dealId: string,
  documents: GeneratedDocument[]
): Deal | undefined {
  const deals = loadDeals();

  let updated: Deal | undefined;

  const nextDeals = deals.map((deal) => {
    if (deal.id !== dealId) return deal;

    updated = normalizeDeal({
      ...deal,
      generatedDocuments: documents,
      updatedAt: new Date().toISOString(),
    });

    return updated;
  });

  if (!updated) {
    const fallback = initialDeals.find((deal) => deal.id === dealId);
    if (!fallback) return undefined;

    updated = normalizeDeal({
      ...fallback,
      generatedDocuments: documents,
      updatedAt: new Date().toISOString(),
    });

    saveDeals([updated, ...deals]);
    return updated;
  }

  saveDeals(nextDeals);
  return updated;
}

export function markDealDocumentsGenerating(dealId: string): Deal | undefined {
  const deals = loadDeals();

  let updated: Deal | undefined;

  const nextDeals = deals.map((deal) => {
    if (deal.id !== dealId) return deal;

    updated = normalizeDeal({
      ...deal,
      generatedDocuments:
        deal.generatedDocuments.length > 0
          ? deal.generatedDocuments.map((doc) => ({
              ...doc,
              status: "generating" as const,
            }))
          : [
              {
                id: `doc-${Date.now()}-temp-1`,
                name: "Generating Package",
                fileType: "pdf" as const,
                status: "generating" as const,
                generatedAt: new Date().toISOString(),
              },
            ],
      updatedAt: new Date().toISOString(),
    });

    return updated;
  });

  if (!updated) {
    const fallback = initialDeals.find((deal) => deal.id === dealId);
    if (!fallback) return undefined;

    updated = normalizeDeal({
      ...fallback,
      generatedDocuments:
        fallback.generatedDocuments.length > 0
          ? fallback.generatedDocuments.map((doc) => ({
              ...doc,
              status: "generating" as const,
            }))
          : [
              {
                id: `doc-${Date.now()}-temp-1`,
                name: "Generating Package",
                fileType: "pdf" as const,
                status: "generating" as const,
                generatedAt: new Date().toISOString(),
              },
            ],
      updatedAt: new Date().toISOString(),
    });

    saveDeals([updated, ...deals]);
    return updated;
  }

  saveDeals(nextDeals);
  return updated;
}

export function markSingleDealDocumentGenerating(
  dealId: string,
  documentId: string
): Deal | undefined {
  const deals = loadDeals();

  let updated: Deal | undefined;

  const nextDeals = deals.map((deal) => {
    if (deal.id !== dealId) return deal;

    updated = normalizeDeal({
      ...deal,
      generatedDocuments: deal.generatedDocuments.map((doc) =>
        doc.id === documentId ? { ...doc, status: "generating" as const } : doc
      ),
      updatedAt: new Date().toISOString(),
    });

    return updated;
  });

  if (!updated) return getDealById(dealId);

  saveDeals(nextDeals);
  return updated;
}

export function replaceSingleDealDocument(
  dealId: string,
  nextDocument: GeneratedDocument
): Deal | undefined {
  const deals = loadDeals();

  let updated: Deal | undefined;

  const nextDeals = deals.map((deal) => {
    if (deal.id !== dealId) return deal;

    const existingIndex = deal.generatedDocuments.findIndex(
      (doc) =>
        doc.name.toLowerCase() === nextDocument.name.toLowerCase() &&
        doc.fileType === nextDocument.fileType
    );

    let nextDocuments = [...deal.generatedDocuments];

    if (existingIndex >= 0) {
      nextDocuments[existingIndex] = nextDocument;
    } else {
      nextDocuments = [nextDocument, ...nextDocuments];
    }

    updated = normalizeDeal({
      ...deal,
      generatedDocuments: nextDocuments,
      updatedAt: new Date().toISOString(),
    });

    return updated;
  });

  if (!updated) return getDealById(dealId);

  saveDeals(nextDeals);
  return updated;
}