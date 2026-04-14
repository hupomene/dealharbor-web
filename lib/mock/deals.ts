import { Deal } from "@/lib/types/deal";

export const initialDeals: Deal[] = [
  {
    id: "deal-1001",
    businessName: "North Ridge Auto Care",
    state: "Texas",
    dealType: "Asset Purchase",

    sellerName: "Oak Street Holdings LLC",
    sellerAddress: "1450 Oak Street, Dallas, TX 75201",

    buyerName: "North Ridge Ventures LLC",
    buyerAddress: "890 Preston Ridge Blvd, Plano, TX 75024",

    purchasePrice: "$850,000",
    depositAmount: "$50,000",
    closingDate: "2026-06-30",

    sellerFinancingEnabled: true,
    sellerFinancingAmount: "$200,000",

    allocatedInventory: "$120,000",
    allocatedFFE: "$180,000",
    allocatedGoodwill: "$550,000",

    includedAssetsText:
      "Inventory, furniture, fixtures, equipment, customer lists, trade name, website assets, and goodwill.",
    excludedAssetsText:
      "Cash on hand, seller bank accounts, tax refunds, and seller personal tools not listed on the equipment schedule.",

    nonCompeteYears: "5",
    nonCompeteMiles: "25",

    equipmentItems: [
      {
        id: "eq-1001",
        name: "Hydraulic Lift",
        quantity: "2",
        notes: "In operating condition",
      },
      {
        id: "eq-1002",
        name: "Tire Balancer",
        quantity: "1",
        notes: "Transferred as-is",
      },
    ],

    closingChecklistItems: [
      {
        id: "cl-1001",
        label: "Execute Asset Purchase Agreement",
        completed: false,
      },
      {
        id: "cl-1002",
        label: "Deliver Bill of Sale",
        completed: false,
      },
      {
        id: "cl-1003",
        label: "Confirm assignment of lease or new lease",
        completed: false,
      },
    ],

    createdAt: "2026-03-26T09:00:00.000Z",
    updatedAt: "2026-03-26T09:00:00.000Z",

    generatedDocuments: [
      {
        id: "doc-1",
        name: "Asset Purchase Agreement",
        status: "ready",
        fileType: "pdf",
        generatedAt: "2026-03-26T09:00:00.000Z",
      },
      {
        id: "doc-2",
        name: "Promissory Note",
        status: "ready",
        fileType: "pdf",
        generatedAt: "2026-03-26T09:00:00.000Z",
      },
      {
        id: "doc-3",
        name: "Bill of Sale",
        status: "ready",
        fileType: "pdf",
        generatedAt: "2026-03-26T09:00:00.000Z",
      },
      {
        id: "doc-4",
        name: "Non-Compete Agreement",
        status: "ready",
        fileType: "pdf",
        generatedAt: "2026-03-26T09:00:00.000Z",
      },
      {
        id: "doc-5",
        name: "Equipment List",
        status: "ready",
        fileType: "docx",
        generatedAt: "2026-03-26T09:00:00.000Z",
      },
      {
        id: "doc-6",
        name: "Closing Checklist",
        status: "ready",
        fileType: "docx",
        generatedAt: "2026-03-26T09:00:00.000Z",
      },
    ],
  },
  {
    id: "deal-1002",
    businessName: "Sunset Family Market",
    state: "Oklahoma",
    dealType: "Asset Purchase",

    sellerName: "Sunset Retail Group",
    sellerAddress: "101 Market Street, Tulsa, OK 74103",

    buyerName: "Red Cedar Holdings",
    buyerAddress: "700 Cedar Avenue, Edmond, OK 73034",

    purchasePrice: "$420,000",
    depositAmount: "$25,000",
    closingDate: "2026-05-15",

    sellerFinancingEnabled: false,
    sellerFinancingAmount: "",

    allocatedInventory: "$150,000",
    allocatedFFE: "$70,000",
    allocatedGoodwill: "$200,000",

    includedAssetsText:
      "Inventory, shelving, refrigeration units, POS equipment, customer phone number, and goodwill.",
    excludedAssetsText:
      "Seller receivables, cash drawers, and personal delivery van not included in the bill of sale.",

    nonCompeteYears: "3",
    nonCompeteMiles: "15",

    equipmentItems: [
      {
        id: "eq-2001",
        name: "Reach-in Cooler",
        quantity: "3",
        notes: "Included in sale",
      },
    ],

    closingChecklistItems: [
      {
        id: "cl-2001",
        label: "Execute closing statement",
        completed: false,
      },
      {
        id: "cl-2002",
        label: "Transfer POS credentials",
        completed: false,
      },
    ],

    createdAt: "2026-03-24T11:15:00.000Z",
    updatedAt: "2026-03-25T16:45:00.000Z",

    generatedDocuments: [
      {
        id: "doc-7",
        name: "Asset Purchase Agreement",
        status: "ready",
        fileType: "pdf",
        generatedAt: "2026-03-25T16:45:00.000Z",
      },
      {
        id: "doc-8",
        name: "Bill of Sale",
        status: "ready",
        fileType: "pdf",
        generatedAt: "2026-03-25T16:45:00.000Z",
      },
      {
        id: "doc-9",
        name: "Non-Compete Agreement",
        status: "ready",
        fileType: "pdf",
        generatedAt: "2026-03-25T16:45:00.000Z",
      },
      {
        id: "doc-10",
        name: "Equipment List",
        status: "ready",
        fileType: "docx",
        generatedAt: "2026-03-25T16:45:00.000Z",
      },
      {
        id: "doc-11",
        name: "Closing Checklist",
        status: "ready",
        fileType: "docx",
        generatedAt: "2026-03-25T16:45:00.000Z",
      },
    ],
  },
];