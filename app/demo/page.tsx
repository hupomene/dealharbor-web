import Image from "next/image";
import Link from "next/link";

const SINGLE_DEAL_PAYMENT_LINK =
  "https://buy.stripe.com/7sYbJ28Om2BEdKdeKhfUQ02";

const BROKER_PLAN_PAYMENT_LINK =
  "https://buy.stripe.com/5kQ14oaWu902ay18lTfUQ03";

const intakeSteps = [
  {
    label: "Step 1 of 8 — Deal Overview",
    description:
      "Core deal information such as business name, business type, location, agreement date, closing date, and closing method.",
    image: "/demo/intake/01-intake-deal-overview.png",
  },
  {
    label: "Step 2 of 8 — Buyer & Seller",
    description:
      "Buyer and seller names, addresses, entity details, EIN, and governing state used across the document package.",
    image: "/demo/intake/02-intake-parties.png",
  },
  {
    label: "Step 3 of 8 — Included / Excluded Assets",
    description:
      "Assets included in the sale, excluded assets, assumed liabilities, and excluded liabilities.",
    image: "/demo/intake/03-intake-assets.png",
  },
  {
    label: "Step 4 of 8 — Payment Terms",
    description:
      "Purchase price, deposit, cash at closing, seller financing amount, interest rate, term, and payment dates.",
    image: "/demo/intake/04-intake-payment-terms.png",
  },
  {
    label: "Step 5 of 8 — Purchase Price Allocation",
    description:
      "Allocation categories used for the APA, non-compete allocation, IRS Form 8594 summary, and review checks.",
    image: "/demo/intake/05-intake-purchase-price-allocation.png",
  },
  {
    label: "Step 6 of 8 — Non-Compete",
    description:
      "Restricted term, restricted radius, restricted business, restricted territory, and non-compete allocation.",
    image: "/demo/intake/06-intake-non-compete.png",
  },
  {
    label: "Step 7 of 8 — Escrow, Lease Assignment & Due Diligence",
    description:
      "Escrow holder, release conditions, landlord consent, lease assignment conditions, and due diligence period.",
    image: "/demo/intake/07-intake-escrow-lease-due-diligence.png",
  },
  {
    label: "Step 8 of 8 — Schedule Data & Closing Checklist",
    description:
      "Equipment schedule, closing deliverables, readiness checklist, and document generation preparation.",
    image: "/demo/intake/08-intake-schedule-data.png",
  },
];

const documentGroups = [
  {
    title: "Asset Purchase Agreement",
    badge: "APA",
    description:
      "Shows how deal overview, assets, purchase price, allocation, closing, diligence, and covenant terms appear in the APA.",
    images: [
      {
        label: "APA Preview 1 — Overview & Assets",
        image: "/demo/documents/apa/apa-01-overview-assets.png",
      },
      {
        label: "APA Preview 2 — Purchase Price & Allocation",
        image: "/demo/documents/apa/apa-02-purchase-price-allocation.png",
      },
      {
        label: "APA Preview 3 — Closing, Diligence & Covenants",
        image: "/demo/documents/apa/apa-03-closing-diligence-covenants.png",
      },
    ],
  },
  {
    title: "Bill of Sale",
    badge: "BOS",
    description:
      "Shows how transferred assets, consideration, and signature sections are generated from the same deal data.",
    images: [
      {
        label: "BOS Preview 1 — Summary & Assets",
        image: "/demo/documents/bos/bos-01-summary-assets.png",
      },
      {
        label: "BOS Preview 2 — Consideration & Signatures",
        image: "/demo/documents/bos/bos-02-consideration-signatures.png",
      },
    ],
  },
  {
    title: "Promissory Note",
    badge: "PN",
    description:
      "Shows how seller financing terms become note principal, payment terms, default provisions, and signature sections.",
    images: [
      {
        label: "PN Preview 1 — Principal & Payment Terms",
        image:
          "/demo/documents/promissory-note/promissory-note-01-principal-payment-terms.png",
      },
      {
        label: "PN Preview 2 — Default & Governing Law",
        image:
          "/demo/documents/promissory-note/promissory-note-02-default-governing-law.png",
      },
      {
        label: "PN Preview 3 — Signature Dates",
        image:
          "/demo/documents/promissory-note/promissory-note-03-signature-dates.png",
      },
    ],
  },
  {
    title: "Non-Compete Agreement",
    badge: "NC",
    description:
      "Shows how restricted term, radius, business scope, territory, and allocation appear in the non-compete document.",
    images: [
      {
        label: "NC Preview 1 — Key Terms & Restrictions",
        image:
          "/demo/documents/non-compete/non-compete-01-key-terms-restrictions.png",
      },
      {
        label: "NC Preview 2 — Governing Law & Signatures",
        image:
          "/demo/documents/non-compete/non-compete-02-governing-law-signatures.png",
      },
    ],
  },
  {
    title: "IRS Form 8594 Allocation Summary",
    badge: "IRS 8594",
    description:
      "Shows the purchase price allocation summary prepared for CPA or tax advisor review.",
    images: [
      {
        label: "IRS 8594 Preview — Allocation Summary",
        image:
          "/demo/documents/irs-8594/irs-8594-01-allocation-summary.png",
      },
    ],
  },
];

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="bg-[#061d3a] px-6 py-16 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-300">
                PactAnchor Demo Preview
              </p>

              <h1 className="mt-5 max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">
                Preview a complete business sale document package
              </h1>

              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-200">
                See how one guided deal intake becomes a synchronized draft
                package including an Asset Purchase Agreement, Bill of Sale,
                Promissory Note, Non-Compete Agreement, and IRS Form 8594
                Allocation Summary.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={SINGLE_DEAL_PAYMENT_LINK}
                  className="rounded-xl bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-300"
                >
                  Start with One Deal — $49
                </a>

                <a
                  href={BROKER_PLAN_PAYMENT_LINK}
                  className="rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
                >
                  Broker Launch Plan — $149/month
                </a>

                <Link
                  href="/"
                  className="rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
                >
                  Back to Home
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-white/15 bg-white/10 p-5 text-sm leading-6 text-slate-100 md:max-w-sm">
              <p className="font-semibold text-white">Preview only</p>
              <p className="mt-2">
                The images below are sample previews. Downloadable DOCX/PDF
                documents are available after purchase.
              </p>
              <p className="mt-3 text-amber-200">
                PactAnchor is not a law firm and does not provide legal advice.
                Documents should be reviewed by qualified counsel before use.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-600">
              Step 1
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              Guided deal intake
            </h2>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
              PactAnchor collects the core transaction terms once, then reuses
              those terms across the generated document package.
            </p>
          </div>

          <div className="space-y-8">
            {intakeSteps.map((step) => (
              <article
                key={step.image}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="border-b border-slate-200 p-6">
                  <p className="text-sm font-semibold text-amber-700">
                    {step.label}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {step.description}
                  </p>
                </div>

                <div className="bg-slate-100 p-4">
                  <div className="relative mx-auto aspect-[16/10] max-w-6xl overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <Image
                      src={step.image}
                      alt={step.label}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 1200px"
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-600">
              Step 2
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              Generated document package
            </h2>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
              The same buyer, seller, purchase price, asset list, seller
              financing terms, non-compete terms, and allocation data are
              reflected across multiple draft documents.
            </p>
          </div>

          <div className="space-y-12">
            {documentGroups.map((group) => (
              <article key={group.title}>
                <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <div className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                      {group.badge}
                    </div>

                    <h3 className="mt-3 text-2xl font-bold text-slate-950">
                      {group.title}
                    </h3>

                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                      {group.description}
                    </p>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  {group.images.map((item) => (
                    <div
                      key={item.image}
                      className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-sm"
                    >
                      <div className="border-b border-slate-200 bg-white p-4">
                        <p className="text-sm font-semibold text-slate-900">
                          {item.label}
                        </p>
                      </div>

                      <div className="relative aspect-[3/4] bg-white">
                        <Image
                          src={item.image}
                          alt={item.label}
                          fill
                          className="object-contain"
                          sizes="(max-width: 768px) 100vw, 620px"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#061d3a] px-6 py-14 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-300">
              Ready to generate your own package?
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              Start with one guided intake and download your documents after
              purchase.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-200">
              Preview images are sample-only. Paid users can create their own
              deal, generate downloadable DOCX/PDF drafts, and submit documents
              for attorney review.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={SINGLE_DEAL_PAYMENT_LINK}
              className="rounded-xl bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-300"
            >
              Start with One Deal — $49
            </a>

            <a
              href={BROKER_PLAN_PAYMENT_LINK}
              className="rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Broker Launch Plan — $149/month
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}