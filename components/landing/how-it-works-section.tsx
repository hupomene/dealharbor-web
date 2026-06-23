import Link from "next/link";

const steps = [
  {
    step: "01",
    title: "Enter Deal Terms Once",
    description:
      "Add seller, buyer, purchase price, down payment, assets, seller financing, closing date, and non-compete details in one guided workspace.",
  },
  {
    step: "02",
    title: "Preview the APA Live",
    description:
      "Save the deal and see how your terms map into a live Asset Purchase Agreement preview before unlocking the final draft package.",
  },
  {
    step: "03",
    title: "Unlock the Full Draft Package",
    description:
      "Generate attorney-review-ready draft documents including APA, Bill of Sale, Promissory Note, Non-Compete, and IRS 8594 support.",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="border-y border-slate-200 bg-white px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-600">
            How PactAnchor Works
          </p>

          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            From deal intake to draft package in minutes
          </h2>

          <p className="mt-5 text-base leading-8 text-slate-600">
            PactAnchor helps small business brokers and advisors move from
            structured deal intake to synchronized, attorney-review-ready draft
            packages without manually copying the same terms across separate
            documents.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {steps.map((item) => (
            <div
              key={item.step}
              className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm"
            >
              <div className="mb-8 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white">
                  {item.step}
                </div>

                <div className="h-px flex-1 bg-slate-200 ml-5" />
              </div>

              <h3 className="text-xl font-semibold text-slate-950">
                {item.title}
              </h3>

              <p className="mt-4 text-sm leading-7 text-slate-600">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-3xl border border-amber-200 bg-amber-50 p-6 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h3 className="text-2xl font-semibold text-slate-950">
                Try it with a sample deal before paying.
              </h3>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-700">
                Create a free workspace, enter one sample transaction, save the
                deal terms, and preview how those terms appear in the APA before
                unlocking the full draft package.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link
                href="/signup?next=%2Fdashboard"
                className="inline-flex justify-center rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Start Free Workspace
              </Link>

              <Link
                href="/pricing"
                className="inline-flex justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>

        <p className="mx-auto mt-6 max-w-4xl text-center text-xs leading-6 text-slate-500">
          PactAnchor provides document automation for attorney-review-ready
          draft packages. PactAnchor is not a law firm and does not provide
          legal, tax, or financial advice.
        </p>
      </div>
    </section>
  );
}