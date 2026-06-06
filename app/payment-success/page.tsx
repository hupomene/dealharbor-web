export default function PaymentSuccessPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-20 text-center">
        <div className="mb-6 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-300">
          Payment received
        </div>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Thank you for joining PactAnchor.
        </h1>

        <p className="mt-6 text-lg leading-8 text-slate-300">
          Your payment has been received. Please create or log in to your
          PactAnchor account using the same email address used for payment.
        </p>

        <div className="mt-10 w-full rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-left shadow-xl">
          <h2 className="text-xl font-semibold text-white">Next steps</h2>

          <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
            <li>
              <span className="font-semibold text-white">1.</span> Create or
              log in to your PactAnchor account.
            </li>
            <li>
              <span className="font-semibold text-white">2.</span> Start a new
              deal from your dashboard.
            </li>
            <li>
              <span className="font-semibold text-white">3.</span> Enter the
              deal information once.
            </li>
            <li>
              <span className="font-semibold text-white">4.</span> Generate
              your synchronized document package.
            </li>
          </ol>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href="/dashboard"
            className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
          >
            Go to Dashboard
          </a>

          <a
            href="/deals/new"
            className="rounded-xl border border-slate-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-900"
          >
            Start a New Deal
          </a>
        </div>

        <p className="mt-10 max-w-2xl text-xs leading-6 text-slate-500">
          PactAnchor is a document automation platform designed to help prepare
          attorney-review-ready draft transaction documents. PactAnchor is not a
          law firm and does not provide legal advice. Users should consult a
          qualified attorney before using any document in a real transaction.
        </p>

        <p className="mt-4 text-xs text-slate-500">
          Covenant AI Solutions LLC
        </p>
      </section>
    </main>
  );
}