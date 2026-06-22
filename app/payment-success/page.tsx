import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-20 text-center">
        <div className="mb-6 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-300">
          Payment received
        </div>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Your PactAnchor workspace is being unlocked.
        </h1>

        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
          Thank you for your purchase. If you used the same email address as
          your PactAnchor account during checkout, your workspace should update
          shortly and unlock document generation and download access.
        </p>

        <div className="mt-10 grid w-full gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-left shadow-xl">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/10 text-sm font-bold text-emerald-300">
              1
            </div>

            <h2 className="text-lg font-semibold text-white">
              Payment confirmed
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Stripe has received your payment. PactAnchor uses your checkout
              email to match the payment to your workspace.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-left shadow-xl">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/10 text-sm font-bold text-emerald-300">
              2
            </div>

            <h2 className="text-lg font-semibold text-white">
              Workspace unlocks automatically
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Your account access and eligible deal workspace are updated after
              payment verification. This usually happens shortly after checkout.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-left shadow-xl">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/10 text-sm font-bold text-emerald-300">
              3
            </div>

            <h2 className="text-lg font-semibold text-white">
              Generate your draft package
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Return to your dashboard, open your deal, and generate the
              attorney-review-ready draft document package for your transaction.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
          >
            Go to Dashboard
          </Link>

          <Link
            href="/login"
            className="rounded-xl border border-slate-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-900"
          >
            Sign In
          </Link>

          <Link
            href="/signup"
            className="rounded-xl border border-slate-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-900"
          >
            Create Account
          </Link>
        </div>

        <div className="mt-10 max-w-3xl rounded-2xl border border-amber-400/20 bg-amber-400/10 p-5 text-left">
          <h2 className="text-sm font-semibold text-amber-200">
            Access note
          </h2>

          <p className="mt-2 text-sm leading-6 text-amber-100/90">
            If your workspace still appears locked, make sure you are signed in
            with the same email address used during Stripe checkout. If access
            does not update shortly, contact us at info@pactanchor.com and
            include your checkout email.
          </p>
        </div>

        <p className="mt-10 max-w-2xl text-xs leading-6 text-slate-500">
          PactAnchor is a document automation platform designed to help prepare
          attorney-review-ready draft transaction documents. PactAnchor is not a
          law firm and does not provide legal advice. Users should consult a
          qualified attorney before using any document in a real transaction.
        </p>

        <p className="mt-4 text-xs text-slate-500">
          PactAnchor is operated by Covenant AI Solutions LLC.
        </p>
      </section>
    </main>
  );
}