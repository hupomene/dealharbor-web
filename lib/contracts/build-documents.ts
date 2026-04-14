import { GeneratedDocument } from "@/lib/types/deal";

export function buildGeneratedDocuments(
  sellerFinancingEnabled: boolean
): GeneratedDocument[] {
  const now = new Date().toISOString();

  const docs: GeneratedDocument[] = [
    {
      id: `doc-${Date.now()}-1`,
      name: "Asset Purchase Agreement",
      fileType: "pdf",
      status: "ready",
      generatedAt: now,
    },
    {
      id: `doc-${Date.now()}-2`,
      name: "Bill of Sale",
      fileType: "pdf",
      status: "ready",
      generatedAt: now,
    },
    {
      id: `doc-${Date.now()}-3`,
      name: "Non-Compete Agreement",
      fileType: "pdf",
      status: "ready",
      generatedAt: now,
    },
    {
      id: `doc-${Date.now()}-4`,
      name: "Equipment List",
      fileType: "docx",
      status: "ready",
      generatedAt: now,
    },
    {
      id: `doc-${Date.now()}-5`,
      name: "Closing Checklist",
      fileType: "docx",
      status: "ready",
      generatedAt: now,
    },
  ];

  if (sellerFinancingEnabled) {
    docs.splice(1, 0, {
      id: `doc-${Date.now()}-6`,
      name: "Promissory Note",
      fileType: "pdf",
      status: "ready",
      generatedAt: now,
    });
  }

  return docs;
}

export function buildSingleGeneratedDocument(
  targetDocumentName: string,
  fileType: "pdf" | "docx"
): GeneratedDocument {
  return {
    id: `doc-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    name: stripFileExtension(targetDocumentName),
    fileType,
    status: "ready",
    generatedAt: new Date().toISOString(),
  };
}

export function formatDocumentFilename(doc: GeneratedDocument) {
  const cleanName = stripFileExtension(doc.name);
  return `${cleanName}.${doc.fileType}`;
}

function stripFileExtension(name: string) {
  return name.replace(/\.(pdf|docx)$/i, "");
}