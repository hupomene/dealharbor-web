"use client";

import { useEffect, useMemo, useState } from "react";
import ExportPaywallModal from "@/components/paywall/export-paywall-modal";

type PreviewSection = {
  heading: string;
  body: string;
  locked?: boolean;
};

type PreviewPayload = {
  documentType: "asset_purchase_agreement";
  title: string;
  subtitle: string;
  previewMode: "redacted";
  generatedFrom: "saved_deal_terms";
  sections: PreviewSection[];
  lockedMessage: string;
};

type PreviewApiResponse = {
  success: boolean;
  preview: PreviewPayload;
  access: {
    accessStatus: string;
    planType: string | null;
    isSandboxDeal: boolean;
    canExportDocuments: boolean;
    previewMode: "redacted";
    exportLocked: boolean;
  };
};

type LiveDocumentPreviewPanelProps = {
  dealId: string;
  refreshKey?: number;
  isSandboxDeal?: boolean;
  canExportDocuments?: boolean;
};

function renderBodyLines(body: string) {
  return body.split("\n").map((line, index) => (
    <span key={`${line}-${index}`} className="block">
      {line.trim().length > 0 ? line : "\u00A0"}
    </span>
  ));
}

export default function LiveDocumentPreviewPanel({
  dealId,
  refreshKey = 0,
  isSandboxDeal = false,
  canExportDocuments = true,
}: LiveDocumentPreviewPanelProps) {
  const [preview, setPreview] = useState<PreviewPayload | null>(null);
  const [apiExportLocked, setApiExportLocked] = useState(!canExportDocuments);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);

  const exportLocked = useMemo(
    () => apiExportLocked || !canExportDocuments,
    [apiExportLocked, canExportDocuments]
  );

  useEffect(() => {
    let cancelled = false;

    const loadPreview = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/deals/${dealId}/preview?document=apa`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );

        const payload = (await response.json()) as
          | PreviewApiResponse
          | { error?: string };

        if (!response.ok) {
          throw new Error(
            "error" in payload && payload.error
              ? payload.error
              : "Unable to load document preview."
          );
        }

        if (!cancelled) {
          const data = payload as PreviewApiResponse;
          setPreview(data.preview);
          setApiExportLocked(data.access.exportLocked);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load document preview."
          );
          setPreview(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadPreview();

    return () => {
      cancelled = true;
    };
  }, [dealId, refreshKey]);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-600">
            Live Document Preview
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-slate-950">
            Live APA Draft Preview
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            See how your saved deal terms appear in the Asset Purchase
            Agreement before unlocking the full draft package.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-semibold">Generated from saved deal terms</p>
          <p className="mt-1 text-xs leading-5">
            Save your changes above to refresh this preview.
          </p>
        </div>
      </div>

      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-8 text-center text-sm text-slate-600">
          Loading APA preview...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm leading-6 text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && preview && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 p-4">
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="-rotate-12 text-7xl font-black uppercase tracking-[0.18em] text-slate-300/40">
                Preview
              </span>
            </div>

            <div className="relative rounded-2xl bg-white px-6 py-8 shadow-sm ring-1 ring-slate-200">
              <div className="mb-6 border-b border-slate-200 pb-5 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Document Preview · Redacted
                </p>

                <h3 className="mt-3 text-2xl font-bold uppercase tracking-wide text-slate-950">
                  {preview.title}
                </h3>

                <p className="mt-3 text-xs leading-5 text-slate-500">
                  {preview.subtitle}
                </p>
              </div>

              <div className="space-y-5 font-serif text-sm leading-7 text-slate-800">
                {preview.sections.map((section) => (
                  <div
                    key={section.heading}
                    className={
                      section.locked
                        ? "rounded-2xl border border-amber-200 bg-amber-50 p-4 font-sans text-slate-700"
                        : ""
                    }
                  >
                    <h4
                      className={
                        section.locked
                          ? "text-sm font-semibold text-amber-900"
                          : "mb-1 font-sans text-sm font-bold uppercase tracking-wide text-slate-950"
                      }
                    >
                      {section.heading}
                    </h4>

                    <p
                      className={
                        section.locked
                          ? "mt-2 text-sm leading-6"
                          : "whitespace-pre-line"
                      }
                    >
                      {renderBodyLines(section.body)}
                    </p>
                  </div>
                ))}
              </div>

              {exportLocked && (
                <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-950">
                    Full draft package locked
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {preview.lockedMessage}
                  </p>

                  <button
                    type="button"
                    onClick={() => setPaywallOpen(true)}
                    className="mt-4 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    Unlock Full Draft Package
                  </button>
                </div>
              )}
            </div>
          </div>

          <aside className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-950">
              What this preview proves
            </p>

            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <li>✓ Your saved deal terms are mapped into the APA structure.</li>
              <li>✓ Seller, buyer, business, price, and asset terms are reflected.</li>
              <li>✓ Full legal clauses remain locked until export is unlocked.</li>
              <li>✓ Final documents are generated only after upgrade.</li>
            </ul>

            <div className="mt-6 rounded-2xl border border-white bg-white p-4">
              <p className="text-sm font-semibold text-slate-950">
                Included after unlock
              </p>

              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                <li>Asset Purchase Agreement</li>
                <li>Bill of Sale</li>
                <li>Promissory Note</li>
                <li>Non-Compete Agreement</li>
                <li>IRS Form 8594 support</li>
              </ul>
            </div>

            {exportLocked ? (
              <button
                type="button"
                onClick={() => setPaywallOpen(true)}
                className="mt-5 inline-flex w-full justify-center rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-400"
              >
                Unlock Full Draft Package
              </button>
            ) : (
              <p className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800">
                Export is unlocked. Generate the final draft package below.
              </p>
            )}
          </aside>
        </div>
      )}

      <ExportPaywallModal
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        title="Unlock the full draft package."
        description={
          isSandboxDeal
            ? "Your saved deal terms are already mapped into the APA preview. Upgrade to generate and download the complete attorney-review-ready draft package."
            : "Upgrade to generate and download the complete attorney-review-ready draft package."
        }
      />
    </section>
  );
}