export type GeneratedDocument = {
  id: string;
  name: string;
  status: "ready" | "draft" | "generating";
  fileType: "pdf" | "docx";
  generatedAt?: string;
};

export type EquipmentItem = {
  id: string;
  name: string;
  quantity: string;
  notes: string;
};

export type ClosingChecklistItem = {
  id: string;
  label: string;
  completed: boolean;
};

export type Deal = {
  id: string;

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

  createdAt: string;
  updatedAt: string;

  generatedDocuments: GeneratedDocument[];
};