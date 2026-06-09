import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 py-20 text-center">
        <div className="mb-6 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-300">
          Payment received
        </div>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Thank you for joining PactAnchor.
        </h1>

        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
          Your payment has been received. To activate your PactAnchor access,
          please sign in or create an account using the same email address used
          during Stripe checkout.
        </p>

        <div className="mt-10 grid w-full gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-left shadow-xl">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/10 text-sm font-bold text-emerald-300">
              1
            </div>
            <h2 className="text-lg font-semibold text-white">
              Use the same email
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Please use the same email address you used for Stripe payment when
              signing in or creating your PactAnchor account.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-left shadow-xl">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/10 text-sm font-bold text-emerald-300">
              2
            </div>
            <h2 className="text-lg font-semibold text-white">
              Access is reviewed
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              During launch, paid access may be activated after payment
              verification. This helps us keep the system stable while we
              onboard early users.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-left shadow-xl">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/10 text-sm font-bold text-emerald-300">
              3
            </div>
            <h2 className="text-lg font-semibold text-white">
              Start your deal
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Once access is active, you can create a deal, enter transaction
              details once, and generate a synchronized document package.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/login"
            className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
          >
            Sign In
          </Link>

          <Link
            href="/signup"
            className="rounded-xl border border-slate-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-900"
          >
            Create Account
          </Link>

          <Link
            href="/dashboard"
            className="rounded-xl border border-slate-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-900"
          >
            Go to Dashboard
          </Link>
        </div>

        <div className="mt-10 max-w-3xl rounded-2xl border border-amber-400/20 bg-amber-400/10 p-5 text-left">
          <h2 className="text-sm font-semibold text-amber-200">
            Access note
          </h2>
          <p className="mt-2 text-sm leading-6 text-amber-100/90">
            If you completed payment but still see an access pending message,
            make sure you are signed in with the same email used at checkout. If
            access is not activated shortly, please contact Covenant AI
            Solutions LLC with your payment email.
          </p>
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