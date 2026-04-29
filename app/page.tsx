import Link from "next/link";

const valueCards = [
  {
    title: "Smart Deal Intake",
    text: "Capture buyer, seller, purchase price, assets, allocation, and closing terms in one guided workflow.",
    icon: "▦",
  },
  {
    title: "Cross-Document Consistency",
    text: "Keep APA, Bill of Sale, Non-Compete, Promissory Note, and IRS allocation terms aligned.",
    icon: "⛓",
  },
  {
    title: "Closing-Ready Package",
    text: "Generate organized DOCX, PDF, and ZIP packages before attorney review and closing.",
    icon: "✓",
  },
];

const workflow = [
  ["1", "Input Deal Data"],
  ["2", "Validate Fields"],
  ["3", "Detect Mismatches"],
  ["4", "Generate Documents"],
  ["5", "Export Package"],
];

const features = [
  ["Asset Purchase Agreement", "Generate structured APA drafts quickly."],
  ["Bill of Sale", "Create synchronized asset-transfer documents."],
  ["Non-Compete Sync", "Keep covenant terms aligned across the package."],
  ["Promissory Note", "Build seller-financing documents accurately."],
  ["IRS 8594 Support", "Support purchase-price allocation workflows."],
  ["Deal Score", "Evaluate readiness before closing."],
];

const pricing = [
  {
    name: "Starter",
    price: "$49",
    period: "/deal",
    items: ["Smart deal intake", "Standard document package", "DOCX/PDF export"],
  },
  {
    name: "Pro",
    price: "$99",
    period: "/month",
    badge: "Most Popular",
    items: ["Unlimited deals", "Risk warnings", "Allocation mismatch alerts"],
  },
  {
    name: "Firm",
    price: "$299",
    period: "/month",
    items: ["Team collaboration", "Custom templates", "Priority support"],
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="bg-[#061d3a] text-white">
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

        <div className="mx-auto grid max-w-7xl items-center gap-14 px-8 py-20 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <h1 className="max-w-4xl text-5xl font-extrabold leading-tight tracking-tight md:text-6xl">
              Generate Business Sale Documents with Confidence
            </h1>
            <p className="mt-6 max-w-2xl text-xl leading-8 text-slate-200">
              PactAnchor turns one guided deal intake into a consistent,
              closing-ready document package for small business acquisitions.
            </p>
            <p className="mt-5 text-lg font-semibold text-amber-300">
              Built for brokers, attorneys, accountants, advisors, buyers, and sellers.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/login"
                className="rounded-lg bg-amber-400 px-8 py-4 text-base font-bold text-slate-950 hover:bg-amber-300"
              >
                Start a Deal
              </Link>
              <a
                href="#workflow"
                className="rounded-lg border border-slate-400 px-8 py-4 text-base font-bold text-white hover:bg-white/10"
              >
                View Demo
              </a>
            </div>
          </div>

          <div className="grid gap-5">
            {valueCards.map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-slate-500/60 bg-white/5 p-7 shadow-xl"
              >
                <div className="text-3xl text-amber-400">{card.icon}</div>
                <h3 className="mt-4 text-xl font-bold">{card.title}</h3>
                <p className="mt-3 text-base leading-7 text-slate-200">
                  {card.text}
                </p>
              </div>
            ))}
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
                ["Assets", "Furniture, Fixtures, Inventory"],
                ["Closing Date", "06/30/2025"],
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
              <p>✓ Purchase agreement signed</p>
              <p>✓ Assets defined</p>
              <p className="text-red-600">△ Missing buyer state</p>
              <p className="text-red-600">△ Seller EIN missing</p>
              <p className="text-amber-600">△ Allocation mismatch</p>
            </div>
            <div className="mt-6 rounded-xl border border-orange-200 bg-orange-50 p-4 font-semibold text-orange-700">
              ⚠ Risk Warnings · 4
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

      <section id="workflow" className="bg-white py-18">
        <div className="mx-auto max-w-7xl px-8 py-16">
          <h2 className="text-center text-4xl font-extrabold">
            PactAnchor 5-Step Automation Workflow
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-5">
            {workflow.map(([num, title]) => (
              <div key={num} className="rounded-2xl border bg-slate-50 p-7 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#061d3a] text-2xl font-bold text-white">
                  {num}
                </div>
                <h3 className="mt-5 text-lg font-bold">{title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-8 py-16">
        <h2 className="text-center text-4xl font-extrabold">Pricing</h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {pricing.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border bg-white p-8 shadow-sm ${
                plan.badge ? "border-amber-400 ring-2 ring-amber-300" : ""
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-md bg-amber-400 px-8 py-1 text-sm font-bold text-white">
                  {plan.badge}
                </div>
              )}
              <h3 className="text-2xl font-bold">{plan.name}</h3>
              <p className="mt-4">
                <span className="text-5xl font-extrabold">{plan.price}</span>
                <span className="text-slate-500"> {plan.period}</span>
              </p>
              <ul className="mt-8 space-y-3 text-base">
                {plan.items.map((item) => (
                  <li key={item}>✓ {item}</li>
                ))}
              </ul>
            </div>
          ))}
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