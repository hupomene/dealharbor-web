"use client";

type ExportPaywallModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
};

export default function ExportPaywallModal({
  open,
  onClose,
  title = "Your draft package is ready to unlock.",
  description = "Free Workspace lets you preview how your saved deal terms appear in the APA. Upgrade to generate and download the full attorney-review-ready draft package.",
}: ExportPaywallModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">
              Export Locked
            </p>

            <h3 className="mt-2 text-2xl font-semibold text-slate-900">
              {title}
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {description}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-600 hover:bg-slate-100"
          >
            Close
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold text-amber-700">
              Single Deal Package
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-950">
              $49{" "}
              <span className="text-sm font-medium text-slate-500">
                one-time
              </span>
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Unlock PDF draft output for one specific small business sale
              transaction.
            </p>

            <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
              <li>✓ One specific transaction</li>
              <li>✓ PDF draft output</li>
              <li>✓ 30-day workspace access</li>
              <li>✓ Best for one-time deals</li>
            </ul>

            <a
              href="https://buy.stripe.com/7sYbJ28Om2BEdKdeKhfUQ02"
              className="mt-5 inline-flex w-full justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Unlock One Deal — $49
            </a>
          </div>

          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5">
            <p className="text-sm font-semibold text-amber-800">
              Broker Launch Plan
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-950">
              $149
              <span className="text-sm font-medium text-slate-600">
                /month
              </span>
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-700">
              Unlock DOCX, PDF, and ZIP exports for repeated small business
              sale transactions.
            </p>

            <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
              <li>✓ Multiple deal packages</li>
              <li>✓ DOCX / PDF / ZIP exports</li>
              <li>✓ Editable core deal terms</li>
              <li>✓ Best for brokers and advisors</li>
            </ul>

            <a
              href="https://buy.stripe.com/5kQ14oaWu902ay18lTfUQ03"
              className="mt-5 inline-flex w-full justify-center rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-400"
            >
              Start Broker Launch Plan — $149/month
            </a>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs leading-5 text-slate-600">
            Use the same email address you used for your PactAnchor account
            during checkout so your workspace can be matched after payment
            verification.
          </p>
        </div>

        <p className="mt-4 text-xs leading-5 text-slate-500">
          PactAnchor provides attorney-review-ready draft documents and is not a
          law firm. The generated documents should be reviewed by qualified
          counsel before use.
        </p>
      </div>
    </div>
  );
}