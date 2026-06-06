import Image from "next/image";
import Link from "next/link";
import {
  Clock3,
  ShieldCheck,
  RefreshCcw,
  BadgeCheck,
} from "lucide-react";

const valueCards = [
  {
    title: "Smart Deal Intake",
    text: "Capture buyer, seller, purchase price, assets, allocation, liabilities, financing, and closing terms in one guided workflow.",
    icon: "▦",
  },
  {
    title: "Cross-Document Consistency",
    text: "Keep APA, Bill of Sale, Non-Compete, Promissory Note, and IRS allocation details aligned across the package.",
    icon: "⛓",
  },
  {
    title: "Closing-Ready Package",
    text: "Generate organized DOCX, PDF, and ZIP packages before attorney review and closing.",
    icon: "✓",
  },
];

const workflow = [
  ["1", "Enter Deal Data", "Input buyer, seller, assets, purchase price, financing, liabilities, and closing terms."],
  ["2", "Sync Documents", "PactAnchor aligns APA, BOS, PN, NC, and IRS allocation details from one source of truth."],
  ["3", "Review Readiness", "Validate required fields, allocation balance, risk warnings, and closing deliverables."],
  ["4", "Generate Documents", "Produce structured, consistent transaction documents in DOCX and PDF formats."],
  ["5", "Export Package", "Download a closing-ready ZIP package for review, handoff, and recordkeeping."],
];

const features = [
  ["Asset Purchase Agreement", "Generate structured APA drafts with assets, liabilities, financing, and allocation terms."],
  ["Bill of Sale", "Create synchronized asset-transfer documents from the same deal data."],
  ["Non-Compete Sync", "Keep restricted business, territory, term, and allocation aligned across documents."],
  ["Promissory Note", "Build seller-financing documents with principal, interest, payment dates, and default terms."],
  ["IRS 8594 Support", "Support purchase-price allocation workflows for CPA/tax review."],
  ["Deal Score", "Evaluate readiness, warnings, missing fields, and closing package completeness."],
];

const pricing = [
  {
    name: "Single Deal Package",
    price: "$29",
    period: "one-time",
    badge: "Launch Price",
    description:
      "Generate one synchronized small business sale transaction document package.",
    paymentLink: "https://buy.stripe.com/dRm7sM4y60twgWpeKhfUQ00",
    buttonText: "Start with One Deal",
    items: [
      "One business sale deal package",
      "Asset Purchase Agreement",
      "Bill of Sale",
      "Promissory Note",
      "Non-Compete Agreement",
      "IRS Form 8594 Allocation Summary",
      "DOCX/PDF document output",
      "Report Issue support",
    ],
  },
  {
    name: "Broker Launch Plan",
    price: "$99",
    period: "/month",
    badge: "Best for Brokers",
    description:
      "Monthly launch access for brokers and advisors preparing small business sale document packages.",
    paymentLink: "https://buy.stripe.com/dRm9AU4y67VY6hLgSpfUQ01",
    buttonText: "Get Broker Launch Access",
    items: [
      "Multiple deal packages",
      "Broker-focused workflow",
      "Synchronized APA/BOS/PN/NC documents",
      "IRS Form 8594 Allocation Summary",
      "Closing package document generation",
      "Report Issue channel",
      "Request Feature channel",
      "Priority feedback review",
    ],
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="overflow-hidden bg-[#061d3a] text-white">
        <header className="mx-auto flex max-w-7xl items-center justify-between px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-400 text-2xl text-amber-400">
              ⚓
            </div>
            <div>
              <p className="text-2xl font-bold leading-none">PactAnchor</p>
              <p className="text-[11px] uppercase tracking-[0.24em] text-slate-300">
                Closing with Confidence
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-sm text-slate-200 md:flex">
            <a href="#product">Product</a>
            <a href="#workflow">Workflow</a>
            <a href="#pricing">Pricing</a>
            <a href="#features">Features</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-slate-200">
              Sign In
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-amber-400 px-6 py-3 text-sm font-bold text-slate-950 hover:bg-amber-300"
            >
              Start a Deal
            </Link>
          </div>
        </header>

        <div className="mx-auto grid max-w-7xl items-center gap-10 px-8 py-14 lg:grid-cols-[0.78fr_1.22fr] lg:py-18">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">
              AI-Powered Business Sale Agreement Automation
            </p>

            <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight md:text-5xl xl:text-6xl">
              Close Deals Faster.
              <br />
              With Confidence.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-slate-200 md:text-lg">
              PactAnchor automatically syncs your key deal documents—so every
              Asset Purchase Agreement, Bill of Sale, Promissory Note,
              Non-Compete Agreement, and IRS allocation package stays
              consistent, accurate, and closing-ready.
            </p>

            <div className="mt-7 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
              <div className="rounded-xl border border-white/15 bg-white/5 p-3 text-center">
                <Clock3 className="mx-auto h-7 w-7 text-cyan-300" />
                <p className="mt-3 font-semibold text-slate-100">Save Time</p>
              </div>

              <div className="rounded-xl border border-white/15 bg-white/5 p-3 text-center">
                <ShieldCheck className="mx-auto h-8 w-8 text-green-300" />
                <p className="mt-3 font-semibold text-slate-100">Reduce Mistakes</p>
              </div>

              <div className="rounded-xl border border-white/15 bg-white/5 p-3 text-center">
                <RefreshCcw className="mx-auto h-8 w-8 text-blue-300" />
                <p className="mt-3 font-semibold text-slate-100">Ensure Consistency</p>
              </div>

              <div className="rounded-xl border border-white/15 bg-white/5 p-3 text-center">
                <BadgeCheck className="mx-auto h-8 w-8 text-amber-300" />
                <p className="mt-3 font-semibold text-slate-100">Close with Confidence</p>
              </div>
            </div>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/login"
                className="rounded-lg bg-amber-400 px-8 py-4 text-base font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:bg-amber-300"
              >
                Start Your Deal with Confidence →
              </Link>
              <a
                href="#workflow"
                className="rounded-lg border border-slate-400 px-8 py-4 text-base font-bold text-white hover:bg-white/10"
              >
                Generate Closing-Ready Documents
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-amber-300/20 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-black shadow-2xl lg:-mr-6 xl:-mr-10">
              <video
                className="aspect-video w-full rounded-[2rem] object-cover"
                controls
                preload="metadata"
                poster="/images/pactanchor-hero.png"
              >
                <source src="/videos/PactAnchor-intro.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </section>

      <section id="product" className="mx-auto max-w-7xl px-8 py-16">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="rounded-2xl border bg-white p-7 shadow-sm">
            <h2 className="text-xl font-bold">A · Deal Intake</h2>
            <div className="mt-6 space-y-4 text-sm">
              {[
                ["Buyer", "Evergreen Ventures LLC"],
                ["Seller", "Summit Holdings Inc."],
                ["Purchase Price", "$2,500,000"],
                ["Assets", "Equipment, inventory, leasehold, contracts"],
                ["Closing Date", "06/30/2026"],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="mb-1 text-slate-500">{label}</p>
                  <div className="rounded-lg border bg-slate-50 px-4 py-3">
                    {value}
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-6 w-full rounded-lg bg-[#061d3a] py-4 font-bold text-white">
              Save & Continue
            </button>
          </div>

          <div className="rounded-2xl border bg-white p-7 shadow-sm">
            <h2 className="text-xl font-bold">B · Document Readiness</h2>
            <p className="mt-6 text-4xl font-extrabold">92%</p>
            <div className="mt-4 h-3 rounded-full bg-slate-100">
              <div className="h-3 w-[92%] rounded-full bg-emerald-500" />
            </div>
            <div className="mt-6 space-y-3 text-sm">
              <p>✓ Purchase agreement prepared</p>
              <p>✓ Assets and liabilities defined</p>
              <p>✓ Seller financing terms synced</p>
              <p className="text-amber-600">△ CPA allocation review suggested</p>
              <p className="text-amber-600">△ Landlord consent may be required</p>
            </div>
            <div className="mt-6 rounded-xl border border-orange-200 bg-orange-50 p-4 font-semibold text-orange-700">
              ⚠ Risk Warnings · 2
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-7 shadow-sm">
            <h2 className="text-xl font-bold">C · Generated Documents</h2>
            <div className="mt-6 space-y-3">
              {[
                "Asset Purchase Agreement",
                "Bill of Sale",
                "Non-Compete Agreement",
                "Promissory Note",
                "IRS 8594 Allocation Summary",
                "ZIP Package",
              ].map((doc) => (
                <div
                  key={doc}
                  className="flex items-center justify-between rounded-xl border bg-slate-50 px-4 py-4 text-sm"
                >
                  <span>{doc}</span>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Ready
                  </span>
                </div>
              ))}
            </div>
            <button className="mt-6 w-full rounded-lg bg-[#061d3a] py-4 font-bold text-white">
              Download All ZIP
            </button>
          </div>
        </div>
      </section>
      
      <section className="bg-white px-6 pt-16">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl">
            <Image
              src="/images/pactanchor-hero.png"
              alt="PactAnchor product overview and document automation workflow"
              width={1900}
              height={1100}
              className="h-auto w-full object-contain"
            />
          </div>
        </div>
      </section>

      <section id="workflow" className="bg-white py-18">
        <div className="mx-auto max-w-7xl px-8 py-16">
          <h2 className="text-center text-4xl font-extrabold">
            How PactAnchor Works
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-center text-lg leading-8 text-slate-600">
            From deal intake to document sync, readiness review, and final
            closing package export—PactAnchor keeps the entire transaction
            workflow aligned.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-5">
            {workflow.map(([num, title, text]) => (
              <div key={num} className="rounded-2xl border bg-slate-50 p-7 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#061d3a] text-2xl font-bold text-white">
                  {num}
                </div>
                <h3 className="mt-5 text-lg font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-8 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">
            Launch Access
          </p>

          <h2 className="mt-3 text-4xl font-extrabold">
            Start generating closing-ready documents today.
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            Choose a launch plan and start preparing synchronized small business sale
            transaction documents with PactAnchor.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {pricing.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border bg-white p-8 shadow-sm ${
                plan.badge ? "border-amber-400 ring-2 ring-amber-300" : ""
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-md bg-amber-400 px-8 py-1 text-sm font-bold text-slate-950">
                  {plan.badge}
                </div>
              )}

              <h3 className="text-2xl font-bold">{plan.name}</h3>

              <p className="mt-3 min-h-[52px] text-sm leading-6 text-slate-600">
                {plan.description}
              </p>

              <p className="mt-6">
                <span className="text-5xl font-extrabold">{plan.price}</span>
                <span className="text-slate-500"> {plan.period}</span>
              </p>

              <ul className="mt-8 flex-1 space-y-3 text-base">
                {plan.items.map((item) => (
                  <li key={item}>✓ {item}</li>
                ))}
              </ul>

              <a
                href={plan.paymentLink}
                className="mt-8 block rounded-lg bg-[#061d3a] px-6 py-4 text-center text-base font-bold text-white hover:bg-[#09284f]"
              >
                {plan.buttonText}
              </a>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-4xl rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm leading-7 text-slate-700">
          <p className="font-semibold text-slate-900">
            Attorney review disclaimer
          </p>
          <p className="mt-2">
            PactAnchor is a document automation platform designed to help prepare
            attorney-review-ready draft transaction documents. PactAnchor is not a law
            firm and does not provide legal advice. Users should consult a qualified
            attorney, CPA, or other professional advisor before using any document in a
            real transaction.
          </p>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-8 pb-20">
        <h2 className="text-center text-4xl font-extrabold">Product Features</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {features.map(([title, text]) => (
            <div key={title} className="rounded-2xl border bg-white p-8 shadow-sm">
              <h3 className="text-xl font-bold">{title}</h3>
              <p className="mt-4 text-base leading-7 text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-[#061d3a] px-8 py-8 text-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-sm md:flex-row">
          <p>
            Designed to support document preparation and attorney review workflows.
            Not a substitute for legal, tax, or financial advice.
          </p>
          <p className="text-amber-300">Secure. Encrypted. Trusted.</p>
        </div>
      </footer>
    </main>
  );
}
