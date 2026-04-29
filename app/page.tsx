import Link from "next/link";

const valueCards = [
  {
    title: "Smart Deal Intake",
    text: "Capture buyer, seller, assets, price, and closing terms in one guided workflow.",
    icon: "▦",
  },
  {
    title: "Cross-Document Consistency",
    text: "Keep key deal terms aligned across the APA, Bill of Sale, Non-Compete, Promissory Note, and allocation details.",
    icon: "⛓",
  },
  {
    title: "Closing-Ready Document Package",
    text: "Generate a clean, organized package before attorney review and closing.",
    icon: "✓",
  },
];

const workflow = [
  ["1", "Input Deal Data", "Capture key transaction information through a guided intake."],
  ["2", "Validate Required Fields", "Check completeness before generating documents."],
  ["3", "Detect Mismatches", "Flag inconsistent terms across the deal."],
  ["4", "Generate Closing Documents", "Produce accurate, structured transaction documents."],
  ["5", "Export DOCX / PDF / ZIP", "Deliver a closing-ready package for review and handoff."],
];

const pricing = [
  {
    name: "Starter",
    price: "$49",
    period: "/ deal",
    subtitle: "For one-time small business transactions",
    items: ["Smart deal intake", "Standard document package", "DOCX / PDF / ZIP export"],
  },
  {
    name: "Pro",
    price: "$99",
    period: "/ month",
    subtitle: "For brokers and frequent deal makers",
    badge: "Most Popular",
    items: ["Everything in Starter", "Unlimited deals", "Risk warnings & mismatch alerts", "Priority email support"],
  },
  {
    name: "Firm",
    price: "$299",
    period: "/ month",
    subtitle: "For attorneys, accountants, and advisory teams",
    items: ["Everything in Pro", "Team collaboration", "Custom templates", "Priority support"],
  },
];

const features = [
  ["Asset Purchase Agreement Generator", "Generate structured APA drafts quickly", "📄"],
  ["Bill of Sale Automation", "Create synchronized transfer documents", "💵"],
  ["Non-Compete Allocation Sync", "Keep non-compete terms aligned across the package", "🔁"],
  ["Promissory Note Builder", "Build seller-financing documents accurately", "🖊"],
  ["IRS 8594 Allocation Support", "Support purchase price allocation workflows", "🏛"],
  ["Deal Score & Readiness Check", "Evaluate deal completeness before closing", "🧭"],
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="bg-[#061d3a] text-white">
        <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400 text-xl text-amber-400">
              ⚓
            </div>
            <div>
              <p className="text-2xl font-bold leading-none">PactAnchor</p>
              <p className="text-[10px] uppercase tracking-[0.28em] text-slate-300">
                Closing with Confidence.
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-200 md:flex">
            <a href="#product">Product</a>
            <a href="#solutions">Solutions</a>
            <a href="#pricing">Pricing</a>
            <a href="#resources">Resources</a>
            <span className="border-l border-slate-500 pl-8">🛡 Security</span>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-slate-200">
              Sign In
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-amber-400 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg hover:bg-amber-300"
            >
              Start a Deal
            </Link>
          </div>
        </header>

        <div className="mx-auto grid max-w-7xl gap-10 px-6 pb-20 pt-8 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <h1 className="max-w-3xl text-5xl font-extrabold leading-tight tracking-tight md:text-6xl">
              Generate Business Sale Documents with Confidence
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
              PactAnchor turns one guided deal intake into a consistent,
              closing-ready document package for small business acquisitions.
            </p>
            <p className="mt-4 max-w-xl text-lg font-semibold text-amber-300">
              Built for business brokers, attorneys, accountants, advisors,
              buyers, and sellers.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/login"
                className="rounded-lg bg-amber-400 px-8 py-4 font-bold text-slate-950 shadow-lg hover:bg-amber-300"
              >
                ➜ Start a Deal
              </Link>
              <a
                href="#workflow"
                className="rounded-lg border border-slate-400 px-8 py-4 font-bold text-white hover:bg-white/10"
              >
                ▶ View Demo
              </a>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
            {valueCards.map((card) => (
              <div
                key={card.title}
                className="rounded-xl border border-slate-500/60 bg-white/5 p-6 shadow-xl backdrop-blur"
              >
                <div className="mb-5 text-4xl text-amber-400">{card.icon}</div>
                <h3 className="text-lg font-bold">{card.title}</h3>
                <p className="mt-4 text-sm leading-6 text-slate-200">
                  {card.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="product" className="mx-auto -mt-10 max-w-7xl px-6">
        <div className="grid gap-5 lg:grid-cols-[1.1fr_1.55fr]">
          <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-3">
            <div className="rounded-xl border bg-white p-5 shadow">
              <p className="mb-4 font-bold">A · Deal Intake</p>
              {[
                ["Buyer", "Evergreen Ventures LLC"],
                ["Seller", "Summit Holdings Inc."],
                ["Purchase Price", "$2,500,000"],
                ["Assets", "Furniture, Fixtures, Inventory, Contracts, IP"],
                ["Closing Date", "06/30/2025"],
              ].map(([label, value]) => (
                <div key={label} className="mb-3 grid grid-cols-[80px_1fr] gap-2 text-sm">
                  <span className="text-slate-500">{label}</span>
                  <span className="rounded-md border bg-slate-50 px-3 py-2">
                    {value}
                  </span>
                </div>
              ))}
              <button className="mt-3 w-full rounded-lg bg-[#061d3a] py-3 font-bold text-white">
                Save & Continue
              </button>
            </div>

            <div className="rounded-xl border bg-white p-5 shadow">
              <p className="mb-4 font-bold">B · Document Readiness</p>
              <p className="text-2xl font-bold">92% Complete</p>
              <div className="mt-3 h-2 rounded-full bg-slate-100">
                <div className="h-2 w-[92%] rounded-full bg-emerald-500" />
              </div>
              <div className="mt-5 space-y-2 text-sm">
                <p>✓ Purchase agreement signed</p>
                <p>✓ Assets defined</p>
                <p className="text-red-600">△ Missing Buyer State of Organization</p>
                <p className="text-red-600">△ Seller EIN missing</p>
                <p className="text-amber-600">△ Purchase price allocation not 100%</p>
              </div>
              <div className="mt-5 rounded-lg border border-orange-200 bg-orange-50 p-3 font-semibold text-orange-700">
                ⚠ Risk Warnings · 4
              </div>
            </div>

            <div className="rounded-xl border bg-white p-5 shadow">
              <p className="mb-4 font-bold">C · Generated Documents</p>
              {[
                "Asset Purchase Agreement",
                "Bill of Sale",
                "Non-Compete Agreement",
                "Promissory Note",
                "IRS 8594 Allocation Statement",
                "ZIP Package",
              ].map((doc) => (
                <div
                  key={doc}
                  className="mb-3 flex items-center justify-between rounded-lg border bg-slate-50 px-3 py-3 text-sm"
                >
                  <span>{doc}</span>
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-700">
                    Ready
                  </span>
                </div>
              ))}
              <button className="mt-3 w-full rounded-lg bg-[#061d3a] py-3 font-bold text-white">
                Download All ZIP
              </button>
            </div>
          </div>

          <div id="workflow" className="rounded-xl border bg-white p-6 shadow">
            <h2 className="text-center text-2xl font-bold">
              PactAnchor 5-Step Automation Workflow
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-5">
              {workflow.map(([num, title, text]) => (
                <div key={num} className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#061d3a] text-2xl font-bold text-white">
                    {num}
                  </div>
                  <h3 className="mt-4 text-sm font-bold">{title}</h3>
                  <p className="mt-2 text-xs leading-5 text-slate-600">{text}</p>
                </div>
              ))}
            </div>

            <div id="pricing" className="mt-8 grid gap-5 md:grid-cols-3">
              {pricing.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative rounded-xl border bg-white p-6 shadow-sm ${
                    plan.badge ? "border-amber-400 ring-2 ring-amber-300" : ""
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-md bg-amber-400 px-8 py-1 text-sm font-bold text-white">
                      {plan.badge}
                    </div>
                  )}
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  <p className="mt-2">
                    <span className="text-4xl font-extrabold">{plan.price}</span>
                    <span className="text-sm text-slate-500"> {plan.period}</span>
                  </p>
                  <p className="mt-2 text-sm text-slate-600">{plan.subtitle}</p>
                  <ul className="mt-5 space-y-2 text-sm">
                    {plan.items.map((item) => (
                      <li key={item}>✓ {item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="solutions" className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-6">
          {features.map(([title, text, icon]) => (
            <div key={title} className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="mb-4 text-4xl">{icon}</div>
              <h3 className="font-bold leading-snug">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-[#061d3a] px-6 py-6 text-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-sm md:flex-row">
          <p>
            ⚓ Designed to support document preparation and attorney review
            workflows. Not a substitute for legal, tax, or financial advice.
          </p>
          <p className="text-amber-300">🔒 Secure. Encrypted. Trusted.</p>
        </div>
      </footer>
    </main>
  );
}