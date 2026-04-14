"use client";

import { useState } from "react";
import { Deal, GeneratedDocument } from "@/lib/types/deal";
import { formatDocumentFilename } from "@/lib/contracts/build-documents";
import {
  buildAllDocumentPayloads,
  buildDocumentPayloadForDeal,
} from "@/lib/contracts/document-builders";
import {
  markDealDocumentsGenerating,
  markSingleDealDocumentGenerating,
  replaceDealDocuments,
  replaceSingleDealDocument,
} from "@/lib/storage/deals";

type DealDocumentsPanelProps = {
  deal: Deal;
  onDealUpdated?: (deal: Deal) => void;
};

export default function DealDocumentsPanel({
  deal,
  onDealUpdated,
}: DealDocumentsPanelProps) {
  const [isGeneratingPackage, setIsGeneratingPackage] = useState(false);
  const [isDownloadingDocxZip, setIsDownloadingDocxZip] = useState(false);
  const [isDownloadingPdfZip, setIsDownloadingPdfZip] = useState(false);
  const [regeneratingDocId, setRegeneratingDocId] = useState<string | null>(null);
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);
  const [downloadingPdfDocId, setDownloadingPdfDocId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGeneratePackage() {
    setError(null);
    setIsGeneratingPackage(true);

    const optimisticDeal = markDealDocumentsGenerating(deal.id);
    if (optimisticDeal && onDealUpdated) {
      onDealUpdated(optimisticDeal);
    }

    try {
      const response = await fetch("/api/contracts/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dealId: deal.id,
          sellerFinancingEnabled: deal.sellerFinancingEnabled,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate package");
      }

      const result = (await response.json()) as {
        documents: GeneratedDocument[];
      };

      const updated = replaceDealDocuments(deal.id, result.documents);
      if (updated && onDealUpdated) {
        onDealUpdated(updated);
      }
    } catch {
      setError("Package generation failed. Please try again.");
    } finally {
      setIsGeneratingPackage(false);
    }
  }

  async function handleRegenerateDocument(doc: GeneratedDocument) {
    setError(null);
    setRegeneratingDocId(doc.id);

    const optimisticDeal = markSingleDealDocumentGenerating(deal.id, doc.id);
    if (optimisticDeal && onDealUpdated) {
      onDealUpdated(optimisticDeal);
    }

    try {
      const response = await fetch("/api/contracts/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dealId: deal.id,
          sellerFinancingEnabled: deal.sellerFinancingEnabled,
          targetDocumentName: doc.name,
          fileType: doc.fileType,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to regenerate document");
      }

      const result = (await response.json()) as {
        document: GeneratedDocument;
      };

      const updated = replaceSingleDealDocument(deal.id, result.document);
      if (updated && onDealUpdated) {
        onDealUpdated(updated);
      }
    } catch {
      setError("Document regeneration failed. Please try again.");
    } finally {
      setRegeneratingDocId(null);
    }
  }

  async function handleDownloadDocx(doc: GeneratedDocument) {
    setError(null);
    setDownloadingDocId(doc.id);

    try {
      const payload = buildDocumentPayloadForDeal(deal, doc);

      const response = await fetch("/api/engine/generate-document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payload,
          outputFormat: "docx",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to download DOCX");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = payload.outputFilename.endsWith(".docx")
        ? payload.outputFilename
        : `${payload.outputFilename}.docx`;

      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);

      URL.revokeObjectURL(url);
    } catch {
      setError("DOCX download failed. Check whether the FastAPI contract engine is running.");
    } finally {
      setDownloadingDocId(null);
    }
  }

  async function handleDownloadPdf(doc: GeneratedDocument) {
    setError(null);
    setDownloadingPdfDocId(doc.id);

    try {
      const payload = buildDocumentPayloadForDeal(deal, doc);

      const response = await fetch("/api/engine/generate-document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payload,
          outputFormat: "pdf",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to download PDF");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = payload.outputFilename.replace(/\.docx$/i, ".pdf");

      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);

      URL.revokeObjectURL(url);
    } catch {
      setError("PDF download failed. Install LibreOffice and ensure soffice is available for the FastAPI engine.");
    } finally {
      setDownloadingPdfDocId(null);
    }
  }

  async function handleDownloadPackageZip(outputFormat: "docx" | "pdf") {
    setError(null);

    if (outputFormat === "docx") {
      setIsDownloadingDocxZip(true);
    } else {
      setIsDownloadingPdfZip(true);
    }

    try {
      const payloads = buildAllDocumentPayloads(deal);

      const response = await fetch("/api/engine/generate-package", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          packageName: `${deal.businessName
            .toLowerCase()
            .replaceAll(" ", "-")}-contract-package`,
          payloads,
          outputFormat,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to download package ZIP");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${deal.businessName
        .toLowerCase()
        .replaceAll(" ", "-")}-contract-package-${outputFormat}.zip`;

      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);

      URL.revokeObjectURL(url);
    } catch {
      setError(
        outputFormat === "pdf"
          ? "PDF package ZIP failed. Install LibreOffice and ensure soffice is available."
          : "DOCX package ZIP failed. Check whether the FastAPI contract engine is running."
      );
    } finally {
      if (outputFormat === "docx") {
        setIsDownloadingDocxZip(false);
      } else {
        setIsDownloadingPdfZip(false);
      }
    }
  }

  function handleDownloadPreview(doc: GeneratedDocument) {
    const payload = buildDocumentPayloadForDeal(deal, doc);

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${formatDocumentFilename(doc)}.preview.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    URL.revokeObjectURL(url);
  }

  function handleExportPackageJson() {
    const payload = {
      deal_id: deal.id,
      business_name: deal.businessName,
      exported_at: new Date().toISOString(),
      documents: buildAllDocumentPayloads(deal),
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${deal.businessName
      .toLowerCase()
      .replaceAll(" ", "-")}-document-payloads.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    URL.revokeObjectURL(url);
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">
              Generated Documents
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Package assembled from the structured deal terms.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleGeneratePackage}
              disabled={isGeneratingPackage}
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGeneratingPackage ? "Generating..." : "Generate Package"}
            </button>

            <button
              type="button"
              onClick={() => handleDownloadPackageZip("docx")}
              disabled={isDownloadingDocxZip}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDownloadingDocxZip ? "Preparing DOCX ZIP..." : "Download DOCX ZIP"}
            </button>

            <button
              type="button"
              onClick={() => handleDownloadPackageZip("pdf")}
              disabled={isDownloadingPdfZip}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDownloadingPdfZip ? "Preparing PDF ZIP..." : "Download PDF ZIP"}
            </button>

            <button
              type="button"
              onClick={handleExportPackageJson}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              Export Package JSON
            </button>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-4">
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            {deal.generatedDocuments.length} files
          </span>

          <span className="text-xs text-slate-500">
            {deal.generatedDocuments.some((doc) => doc.status === "generating")
              ? "Generation in progress"
              : "Template-ready payloads available"}
          </span>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {deal.generatedDocuments.map((doc) => {
          const isGeneratingThisDoc =
            doc.status === "generating" || regeneratingDocId === doc.id;
          const isDownloadingThisDoc = downloadingDocId === doc.id;
          const isDownloadingThisPdf = downloadingPdfDocId === doc.id;

          return (
            <div
              key={doc.id}
              className="rounded-2xl border border-slate-200 px-4 py-4"
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-700">
                    {doc.fileType.toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-slate-900">
                      {formatDocumentFilename(doc)}
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <StatusBadge status={doc.status} />
                      {doc.generatedAt ? (
                        <span className="text-xs text-slate-500">
                          Generated {new Date(doc.generatedAt).toLocaleString()}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleRegenerateDocument(doc)}
                    disabled={isGeneratingThisDoc}
                    className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isGeneratingThisDoc ? "Regenerating..." : "Regenerate"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadPreview(doc)}
                    disabled={isGeneratingThisDoc}
                    className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Download Preview JSON
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadDocx(doc)}
                    disabled={isGeneratingThisDoc || isDownloadingThisDoc}
                    className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isDownloadingThisDoc ? "Preparing DOCX..." : "Download DOCX"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadPdf(doc)}
                    disabled={isGeneratingThisDoc || isDownloadingThisPdf}
                    className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isDownloadingThisPdf ? "Preparing PDF..." : "Download PDF"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: "ready" | "draft" | "generating";
}) {
  const styles =
    status === "ready"
      ? "bg-emerald-50 text-emerald-700"
      : status === "generating"
      ? "bg-amber-50 text-amber-700"
      : "bg-slate-100 text-slate-600";

  const label =
    status === "ready"
      ? "Ready"
      : status === "generating"
      ? "Generating"
      : "Draft";

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles}`}>
      {label}
    </span>
  );
}