export type GeneratedArtifact = {
  file_name: string;
  file_type: "docx" | "pdf" | "zip";
  content_base64: string;
};

type OutputFormat = "docx" | "pdf" | "zip";

type RunDocumentGeneratorArgs = {
  dealId: string;
  dealData: Record<string, unknown>;
  templates?: string[];
  outputFormat?: OutputFormat;
};

const DOCUMENT_ENGINE_URL = process.env.DOCUMENT_ENGINE_URL;

if (!DOCUMENT_ENGINE_URL) {
  throw new Error("DOCUMENT_ENGINE_URL is not configured.");
}

const TEMPLATE_METADATA: Record<
  string,
  { documentName: string; outputFilename: string }
> = {
  asset_purchase_agreement: {
    documentName: "Asset Purchase Agreement",
    outputFilename: "asset_purchase_agreement.docx",
  },
  bill_of_sale: {
    documentName: "Bill of Sale",
    outputFilename: "bill_of_sale.docx",
  },
  promissory_note: {
    documentName: "Promissory Note",
    outputFilename: "promissory_note.docx",
  },
  non_compete: {
    documentName: "Non-Compete Agreement",
    outputFilename: "non_compete.docx",
  },
};

function ensureSupportedFileType(value: string): value is "docx" | "pdf" | "zip" {
  return value === "docx" || value === "pdf" || value === "zip";
}

function buildPayloads(
  dealId: string,
  dealData: Record<string, unknown>,
  templates: string[]
) {
  const safeTemplates =
    templates.length > 0 ? templates : ["asset_purchase_agreement"];

  return safeTemplates.map((templateKey) => {
    const meta =
      TEMPLATE_METADATA[templateKey] ?? TEMPLATE_METADATA.asset_purchase_agreement;

    return {
      templateKey,
      documentName: meta.documentName,
      outputFilename: meta.outputFilename,
      generatedAt: new Date().toISOString(),
      dealId,
      businessName:
        typeof dealData.business_name === "string" ? dealData.business_name : "",
      data: dealData,
    };
  });
}

function formatValidationErrors(
  errors: Array<{
    template_key: string;
    document_name: string;
    missing_fields: Array<{ field: string; label: string }>;
  }>
): string {
  return errors
    .map((group) => {
      const missingLabels = group.missing_fields.map((f) => f.label).join(", ");
      return `${group.document_name}: missing ${missingLabels}`;
    })
    .join(" | ");
}

export async function runDocumentGenerator({
  dealId,
  dealData,
  templates = ["asset_purchase_agreement"],
  outputFormat = "docx",
}: RunDocumentGeneratorArgs): Promise<GeneratedArtifact[]> {
  const payloads = buildPayloads(dealId, dealData, templates);
  const requestUrl = `${DOCUMENT_ENGINE_URL}/generate`;

  let response: Response;

  try {
    response = await fetch(requestUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        payloads,
        output_format: outputFormat,
      }),
    });
  } catch (error) {
    console.error("[document-engine] fetch error:", error);
    throw new Error(`Failed to reach document engine at ${DOCUMENT_ENGINE_URL}.`);
  }

  const rawText = await response.text();

  let body: any = null;
  try {
    body = rawText ? JSON.parse(rawText) : null;
  } catch {
    throw new Error(
      `Document engine returned a non-JSON response. Preview: ${rawText.slice(0, 300)}`
    );
  }

  if (!response.ok) {
    const message =
      body && typeof body.error === "string"
        ? body.error
        : body && typeof body.detail === "string"
        ? body.detail
        : "Document engine request failed.";
    throw new Error(message);
  }

  if (body?.validation_errors && Array.isArray(body.validation_errors)) {
    throw new Error(formatValidationErrors(body.validation_errors));
  }

  if (body && typeof body.error === "string") {
    throw new Error(body.error);
  }

  if (!body || !Array.isArray(body.files)) {
    throw new Error("Document engine returned an invalid response.");
  }

  const artifacts: GeneratedArtifact[] = [];

  for (const file of body.files) {
    if (
      !file ||
      typeof file.file_name !== "string" ||
      typeof file.file_type !== "string" ||
      typeof file.content_base64 !== "string"
    ) {
      throw new Error("Document engine returned malformed file payload.");
    }

    if (!ensureSupportedFileType(file.file_type)) {
      throw new Error(`Unsupported file type: ${file.file_type}`);
    }

    artifacts.push({
      file_name: file.file_name,
      file_type: file.file_type,
      content_base64: file.content_base64,
    });
  }

  return artifacts;
}