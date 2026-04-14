"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type DocumentRow = {
  id: string;
  deal_id: string;
  file_name: string;
  file_type: "docx" | "pdf" | "zip";
  file_url: string;
  created_at: string;
  batch_id?: string | null;
};

type HistoryDocument = {
  id: string;
  batch_id: string;
  deal_id: string;
  file_name: string;
  file_type: "docx" | "pdf" | "zip";
  file_url: string;
  created_at: string;
};

type HistoryBatch = {
  id: string;
  deal_id: string;
  user_id: string;
  templates: string[];
  output_format: string;
  review_summary: Record<string, unknown> | null;
  batch_name: string | null;
  batch_notes: string | null;
  batch_tags: string[];
  created_at: string;
  documents: HistoryDocument[];
};

type Props = {
  dealId: string;
};

type TemplateOption = {
  key: string;
  label: string;
};

type MissingField = {
  field: string;
  label: string;
};

type TemplateReadiness = {
  template_key: string;
  document_name: string;
  missing_fields: MissingField[];
  is_ready: boolean;
};

type ReviewSummary = {
  business_name: string;
  seller_name: string;
  buyer_name: string;
  seller_address: string;
  buyer_address: string;
  agreement_date: string;
  closing_date: string;
  state: string;
  purchase_price: string;
  deposit_amount: string;
  cash_at_closing: string;
  seller_financing_amount: string;
  non_compete_years: string;
  non_compete_miles: string;
};

type BatchCompareChange = {
  key: string;
  label: string;
  older_value: string;
  newer_value: string;
  changed: boolean;
};

type BatchCompareResult = {
  older_batch: {
    id: string;
    batch_name: string | null;
    created_at: string;
  };
  newer_batch: {
    id: string;
    batch_name: string | null;
    created_at: string;
  };
  changes: BatchCompareChange[];
};

const TEMPLATE_OPTIONS: TemplateOption[] = [
  { key: "asset_purchase_agreement", label: "Asset Purchase Agreement" },
  { key: "bill_of_sale", label: "Bill of Sale" },
  { key: "promissory_note", label: "Promissory Note" },
  { key: "non_compete", label: "Non-Compete Agreement" },
];

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function templateLabel(key: string) {
  return TEMPLATE_OPTIONS.find((option) => option.key === key)?.label ?? key;
}

function summaryValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

function normalizeTagInput(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function batchDisplayName(batch: {
  id: string;
  batch_name: string | null;
  created_at: string;
}) {
  const base = batch.batch_name?.trim()
    ? batch.batch_name
    : `Batch ${batch.id.slice(0, 8)}`;
  return `${base} · ${formatDate(batch.created_at)}`;
}

async function parseJsonSafely(response: Response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      response.ok
        ? "Server returned a non-JSON response."
        : "API route is missing or returned an HTML error page."
    );
  }
}

function ReviewRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

export default function DocumentGeneratorPanel({ dealId }: Props) {
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [history, setHistory] = useState<HistoryBatch[]>([]);
  const [readiness, setReadiness] = useState<TemplateReadiness[]>([]);
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(null);

  const [loading, setLoading] = useState(true);
  const [readinessLoading, setReadinessLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [generating, setGenerating] = useState(false);
  const [reviewAccepted, setReviewAccepted] = useState(false);

  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([
    "asset_purchase_agreement",
  ]);
  const [outputFormat, setOutputFormat] = useState<"docx" | "pdf" | "zip">(
    "docx"
  );

  const [batchName, setBatchName] = useState("");
  const [batchNotes, setBatchNotes] = useState("");
  const [batchTagsInput, setBatchTagsInput] = useState("");

  const [compareLoading, setCompareLoading] = useState(false);
  const [compareError, setCompareError] = useState<string | null>(null);
  const [compareResult, setCompareResult] = useState<BatchCompareResult | null>(null);
  const [olderBatchId, setOlderBatchId] = useState("");
  const [newerBatchId, setNewerBatchId] = useState("");

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    const response = await fetch(`/api/deals/${dealId}/documents`, {
      method: "GET",
      cache: "no-store",
    });

    const payload = await parseJsonSafely(response);

    if (!response.ok) {
      throw new Error(
        payload && typeof payload.error === "string"
          ? payload.error
          : "Failed to load documents."
      );
    }

    setDocuments(
      payload && Array.isArray(payload.documents) ? payload.documents : []
    );
    setLoading(false);
  }, [dealId]);

  const loadReadiness = useCallback(async () => {
    setReadinessLoading(true);
    const response = await fetch(`/api/deals/${dealId}/document-readiness`, {
      method: "GET",
      cache: "no-store",
    });

    const payload = await parseJsonSafely(response);

    if (!response.ok) {
      throw new Error(
        payload && typeof payload.error === "string"
          ? payload.error
          : "Failed to load template readiness."
      );
    }

    setReadiness(
      payload && Array.isArray(payload.readiness) ? payload.readiness : []
    );
    setReadinessLoading(false);
  }, [dealId]);

  const loadReview = useCallback(async () => {
    setReviewLoading(true);
    const response = await fetch(`/api/deals/${dealId}/document-review`, {
      method: "GET",
      cache: "no-store",
    });

    const payload = await parseJsonSafely(response);

    if (!response.ok) {
      throw new Error(
        payload && typeof payload.error === "string"
          ? payload.error
          : "Failed to load review summary."
      );
    }

    setReviewSummary(payload?.summary ?? null);

    if (payload?.readiness && Array.isArray(payload.readiness)) {
      setReadiness(payload.readiness);
    }

    setReviewLoading(false);
  }, [dealId]);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError(null);

    try {
      const response = await fetch(`/api/deals/${dealId}/generation-history`, {
        method: "GET",
        cache: "no-store",
      });

      const payload = await parseJsonSafely(response);

      if (!response.ok) {
        throw new Error(
          payload && typeof payload.error === "string"
            ? payload.error
            : "Failed to load generation history."
        );
      }

      const nextHistory =
        payload && Array.isArray(payload.history) ? payload.history : [];

      setHistory(nextHistory);

      if (nextHistory.length >= 2) {
        setNewerBatchId((current) => current || nextHistory[0].id);
        setOlderBatchId((current) => current || nextHistory[1].id);
      } else {
        setOlderBatchId("");
        setNewerBatchId("");
      }
    } catch (err) {
      setHistory([]);
      setHistoryError(
        err instanceof Error ? err.message : "Failed to load generation history."
      );
      setOlderBatchId("");
      setNewerBatchId("");
    } finally {
      setHistoryLoading(false);
    }
  }, [dealId]);

  const refreshPanel = useCallback(async () => {
    setError(null);

    try {
      await Promise.all([loadDocuments(), loadReadiness(), loadReview()]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load document panel."
      );
    }

    await loadHistory();
  }, [loadDocuments, loadReadiness, loadReview, loadHistory]);

  useEffect(() => {
    void refreshPanel();
  }, [refreshPanel]);

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ dealId?: string }>;
      if (!customEvent.detail?.dealId || customEvent.detail.dealId === dealId) {
        setReviewAccepted(false);
        setCompareResult(null);
        setCompareError(null);
        void refreshPanel();
      }
    };

    window.addEventListener("deal-updated", handler as EventListener);
    return () => {
      window.removeEventListener("deal-updated", handler as EventListener);
    };
  }, [dealId, refreshPanel]);

  const toggleTemplate = (templateKey: string) => {
    setReviewAccepted(false);
    setSelectedTemplates((current) => {
      if (current.includes(templateKey)) {
        if (current.length === 1) return current;
        return current.filter((key) => key !== templateKey);
      }
      return [...current, templateKey];
    });
  };

  const readinessMap = useMemo(() => {
    const map = new Map<string, TemplateReadiness>();
    for (const item of readiness) {
      map.set(item.template_key, item);
    }
    return map;
  }, [readiness]);

  const selectedReadiness = useMemo(() => {
    return selectedTemplates.map((key) => {
      const found = readinessMap.get(key);

      if (found) return found;

      return {
        template_key: key,
        document_name: TEMPLATE_OPTIONS.find((t) => t.key === key)?.label ?? key,
        missing_fields: [{ field: "readiness", label: "Template readiness data" }],
        is_ready: false,
      } satisfies TemplateReadiness;
    });
  }, [selectedTemplates, readinessMap]);

  const blockingReadiness = useMemo(() => {
    return selectedReadiness.filter(
      (item) => !item.is_ready || item.missing_fields.length > 0
    );
  }, [selectedReadiness]);

  const hasBlockingMissing = blockingReadiness.length > 0;

  const canGenerate =
    !generating &&
    !readinessLoading &&
    !reviewLoading &&
    selectedTemplates.length > 0 &&
    !hasBlockingMissing &&
    reviewAccepted;

  const handleGenerate = async () => {
    if (!canGenerate) {
      setError(
        hasBlockingMissing
          ? `Please complete required fields first: ${blockingReadiness
              .map(
                (item) =>
                  `${item.document_name} (${item.missing_fields
                    .map((f) => f.label)
                    .join(", ")})`
              )
              .join(" | ")}`
          : !reviewAccepted
          ? "Please review the summary and check the confirmation box before generating."
          : "Document generation is not available yet."
      );
      return;
    }

    setGenerating(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/deals/${dealId}/documents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          templates: selectedTemplates,
          output_format: outputFormat,
          batch_name: batchName,
          batch_notes: batchNotes,
          batch_tags: normalizeTagInput(batchTagsInput),
        }),
      });

      const payload = await parseJsonSafely(response);

      if (!response.ok) {
        throw new Error(
          payload && typeof payload.error === "string"
            ? payload.error
            : "Failed to generate contract package."
        );
      }

      setSuccessMessage("Contract package generated successfully.");
      setReviewAccepted(false);
      setBatchName("");
      setBatchNotes("");
      setBatchTagsInput("");
      setCompareResult(null);
      setCompareError(null);
      await refreshPanel();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate contract package."
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleCompare = async () => {
    if (!olderBatchId || !newerBatchId) {
      setCompareError("Please select both batches to compare.");
      return;
    }

    if (olderBatchId === newerBatchId) {
      setCompareError("Please select two different batches.");
      return;
    }

    setCompareLoading(true);
    setCompareError(null);
    setCompareResult(null);

    try {
      const response = await fetch(
        `/api/deals/${dealId}/generation-compare?olderBatchId=${olderBatchId}&newerBatchId=${newerBatchId}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const payload = await parseJsonSafely(response);

      if (!response.ok) {
        throw new Error(
          payload && typeof payload.error === "string"
            ? payload.error
            : "Failed to compare batches."
        );
      }

      setCompareResult(payload as BatchCompareResult);
    } catch (err) {
      setCompareError(
        err instanceof Error ? err.message : "Failed to compare batches."
      );
    } finally {
      setCompareLoading(false);
    }
  };

  const emptyState = useMemo(() => {
    if (loading) return "Loading documents...";
    if (documents.length === 0) return "No generated documents yet.";
    return null;
  }, [loading, documents.length]);

  return (
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Generated Documents
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Select templates, review the summary, add an optional batch label, then generate.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={!canGenerate}
          aria-disabled={!canGenerate}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {generating ? "Generating..." : "Generate Contract"}
        </button>
      </div>

      <div className="mb-6 grid gap-6 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
        <div>
          <p className="mb-3 text-sm font-semibold text-slate-800">Templates</p>
          <div className="grid gap-3">
            {TEMPLATE_OPTIONS.map((option) => {
              const templateState = readinessMap.get(option.key);
              const isReady = templateState?.is_ready ?? false;
              const missingLabels =
                templateState?.missing_fields.map((f) => f.label) ?? [];
              const isSelected = selectedTemplates.includes(option.key);

              return (
                <div
                  key={option.key}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2"
                >
                  <label className="inline-flex items-center gap-3 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleTemplate(option.key)}
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    {option.label}
                  </label>

                  <div className="mt-2 pl-7">
                    {readinessLoading ? (
                      <p className="text-xs text-slate-500">Checking fields...</p>
                    ) : isReady ? (
                      <p className="text-xs font-medium text-emerald-700">Ready</p>
                    ) : (
                      <p className="text-xs text-amber-700">
                        Missing: {missingLabels.join(", ")}
                      </p>
                    )}

                    {isSelected && !isReady && !readinessLoading ? (
                      <p className="mt-1 text-xs font-medium text-red-700">
                        Selected template is blocked until these fields are filled.
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold text-slate-800">Output Format</p>
          <select
            value={outputFormat}
            onChange={(e) =>
              setOutputFormat(e.target.value as "docx" | "pdf" | "zip")
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
          >
            <option value="docx">DOCX</option>
            <option value="pdf">PDF</option>
            <option value="zip">ZIP (DOCX + PDF package)</option>
          </select>
          <p className="mt-2 text-xs text-slate-500">
            ZIP packages the selected templates as both DOCX and PDF files.
          </p>

          <div className="mt-4 grid gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Batch Name
              </label>
              <input
                type="text"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                placeholder="Broker Review Draft"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Batch Tags
              </label>
              <input
                type="text"
                value={batchTagsInput}
                onChange={(e) => setBatchTagsInput(e.target.value)}
                placeholder="broker, draft, texas"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
              />
              <p className="mt-1 text-xs text-slate-500">
                Separate tags with commas.
              </p>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Batch Notes
              </label>
              <textarea
                value={batchNotes}
                onChange={(e) => setBatchNotes(e.target.value)}
                placeholder="Initial draft for broker review before client circulation."
                className="min-h-24 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
              />
            </div>
          </div>

          {hasBlockingMissing ? (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <p className="font-medium">Cannot generate yet.</p>
              <ul className="mt-2 list-disc pl-4">
                {blockingReadiness.map((item) => (
                  <li key={item.template_key}>
                    {item.document_name}:{" "}
                    {item.missing_fields.map((f) => f.label).join(", ")}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
              Selected templates are ready for review.
            </div>
          )}
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <h3 className="text-sm font-semibold text-slate-900">Review Summary</h3>
        <p className="mt-1 text-xs text-slate-500">
          Confirm the key transaction values before generating documents.
        </p>

        {reviewLoading || !reviewSummary ? (
          <p className="mt-4 text-sm text-slate-500">Loading review summary...</p>
        ) : (
          <>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <ReviewRow label="Business Name" value={reviewSummary.business_name} />
              <ReviewRow label="Seller" value={reviewSummary.seller_name} />
              <ReviewRow label="Buyer" value={reviewSummary.buyer_name} />
              <ReviewRow label="State" value={reviewSummary.state} />
              <ReviewRow label="Seller Address" value={reviewSummary.seller_address} />
              <ReviewRow label="Buyer Address" value={reviewSummary.buyer_address} />
              <ReviewRow label="Agreement Date" value={reviewSummary.agreement_date} />
              <ReviewRow label="Closing Date" value={reviewSummary.closing_date} />
              <ReviewRow label="Purchase Price" value={reviewSummary.purchase_price} />
              <ReviewRow label="Deposit Amount" value={reviewSummary.deposit_amount} />
              <ReviewRow label="Cash at Closing" value={reviewSummary.cash_at_closing} />
              <ReviewRow
                label="Seller Financing"
                value={reviewSummary.seller_financing_amount}
              />
              <ReviewRow
                label="Non-Compete Years"
                value={reviewSummary.non_compete_years}
              />
              <ReviewRow
                label="Non-Compete Miles"
                value={reviewSummary.non_compete_miles}
              />
            </div>

            <label className="mt-4 inline-flex items-center gap-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={reviewAccepted}
                onChange={(e) => setReviewAccepted(e.target.checked)}
                disabled={hasBlockingMissing}
                className="h-4 w-4 rounded border-slate-300"
              />
              I reviewed the key values above and want to generate the selected documents.
            </label>
          </>
        )}
      </div>

      <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <h3 className="text-sm font-semibold text-slate-900">Generation History</h3>
        <p className="mt-1 text-xs text-slate-500">
          Each generation run is saved as a batch with its template set, output format, review snapshot, and optional notes.
        </p>

        {historyError ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {historyError}
          </div>
        ) : historyLoading ? (
          <p className="mt-4 text-sm text-slate-500">Loading generation history...</p>
        ) : history.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No generation history yet.</p>
        ) : (
          <div className="mt-4 grid gap-4">
            {history.map((batch) => (
              <div
                key={batch.id}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {batch.batch_name?.trim()
                        ? batch.batch_name
                        : `Batch ${batch.id.slice(0, 8)}`}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Created {formatDate(batch.created_at)}
                    </p>
                  </div>

                  <div className="text-xs text-slate-600">
                    <p>
                      <span className="font-medium">Output:</span>{" "}
                      {summaryValue(batch.output_format)}
                    </p>
                    <p className="mt-1">
                      <span className="font-medium">Templates:</span>{" "}
                      {Array.isArray(batch.templates)
                        ? batch.templates.map(templateLabel).join(", ")
                        : "-"}
                    </p>
                  </div>
                </div>

                {Array.isArray(batch.batch_tags) && batch.batch_tags.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {batch.batch_tags.map((tag) => (
                      <span
                        key={`${batch.id}-${tag}`}
                        className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}

                {batch.batch_notes ? (
                  <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                    <p className="text-xs text-slate-500">Batch Notes</p>
                    <p className="mt-1 text-sm text-slate-800">{batch.batch_notes}</p>
                  </div>
                ) : null}

                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <ReviewRow
                    label="Business Name"
                    value={summaryValue(batch.review_summary?.business_name)}
                  />
                  <ReviewRow
                    label="Seller"
                    value={summaryValue(batch.review_summary?.seller_name)}
                  />
                  <ReviewRow
                    label="Buyer"
                    value={summaryValue(batch.review_summary?.buyer_name)}
                  />
                  <ReviewRow
                    label="Closing Date"
                    value={summaryValue(batch.review_summary?.closing_date)}
                  />
                  <ReviewRow
                    label="Purchase Price"
                    value={summaryValue(batch.review_summary?.purchase_price)}
                  />
                  <ReviewRow
                    label="Cash at Closing"
                    value={summaryValue(batch.review_summary?.cash_at_closing)}
                  />
                  <ReviewRow
                    label="Seller Financing"
                    value={summaryValue(batch.review_summary?.seller_financing_amount)}
                  />
                  <ReviewRow
                    label="State"
                    value={summaryValue(batch.review_summary?.state)}
                  />
                </div>

                <div className="mt-4">
                  <p className="text-xs font-medium text-slate-700">Generated Files</p>

                  {batch.documents.length === 0 ? (
                    <p className="mt-2 text-xs text-slate-500">
                      No files recorded for this batch.
                    </p>
                  ) : (
                    <div className="mt-2 grid gap-2">
                      {batch.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
                        >
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {doc.file_name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {doc.file_type} · {formatDate(doc.created_at)}
                            </p>
                          </div>
                          <a
                            href={`/api/documents/${doc.id}/download`}
                            className="text-sm text-blue-600 underline"
                          >
                            Download
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <h3 className="text-sm font-semibold text-slate-900">Batch Compare</h3>
        <p className="mt-1 text-xs text-slate-500">
          Select two batches and compare the review snapshot values.
        </p>

        {history.length < 2 ? (
          <p className="mt-4 text-sm text-slate-500">
            Create at least two batches to use compare.
          </p>
        ) : (
          <>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Older Batch
                </label>
                <select
                  value={olderBatchId}
                  onChange={(e) => setOlderBatchId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
                >
                  <option value="">Select older batch</option>
                  {history.map((batch) => (
                    <option key={`older-${batch.id}`} value={batch.id}>
                      {batchDisplayName(batch)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Newer Batch
                </label>
                <select
                  value={newerBatchId}
                  onChange={(e) => setNewerBatchId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
                >
                  <option value="">Select newer batch</option>
                  {history.map((batch) => (
                    <option key={`newer-${batch.id}`} value={batch.id}>
                      {batchDisplayName(batch)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={handleCompare}
                disabled={compareLoading}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {compareLoading ? "Comparing..." : "Compare Batches"}
              </button>
            </div>
          </>
        )}

        {compareError ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {compareError}
          </div>
        ) : null}

        {compareResult ? (
          <div className="mt-4">
            <div className="mb-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                <p className="text-xs text-slate-500">Older Batch</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {compareResult.older_batch.batch_name?.trim()
                    ? compareResult.older_batch.batch_name
                    : `Batch ${compareResult.older_batch.id.slice(0, 8)}`}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {formatDate(compareResult.older_batch.created_at)}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                <p className="text-xs text-slate-500">Newer Batch</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {compareResult.newer_batch.batch_name?.trim()
                    ? compareResult.newer_batch.batch_name
                    : `Batch ${compareResult.newer_batch.id.slice(0, 8)}`}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {formatDate(compareResult.newer_batch.created_at)}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-600">
                  <tr>
                    <th className="px-3 py-2">Field</th>
                    <th className="px-3 py-2">Older</th>
                    <th className="px-3 py-2">Newer</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {compareResult.changes.map((change) => (
                    <tr
                      key={change.key}
                      className={change.changed ? "bg-amber-50" : "border-t"}
                    >
                      <td className="px-3 py-2 font-medium text-slate-900">
                        {change.label}
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        {change.older_value}
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        {change.newer_value}
                      </td>
                      <td className="px-3 py-2">
                        {change.changed ? (
                          <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
                            Changed
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                            Same
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      )}

      {emptyState ? (
        <div className="text-sm text-slate-500">{emptyState}</div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-600">
              <th className="pb-2">File</th>
              <th className="pb-2">Type</th>
              <th className="pb-2">Created</th>
              <th className="pb-2"></th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id} className="border-t">
                <td className="py-2">{doc.file_name}</td>
                <td className="py-2">{doc.file_type}</td>
                <td className="py-2">{formatDate(doc.created_at)}</td>
                <td className="py-2">
                  <a
                    href={`/api/documents/${doc.id}/download`}
                    className="text-blue-600 underline"
                  >
                    Download
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}