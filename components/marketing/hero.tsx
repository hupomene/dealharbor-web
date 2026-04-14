import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Container from "@/components/ui/container";
import { HERO_BADGES, SUPPORTED_DOCS } from "@/lib/constants";

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-slate-50 via-white to-white">
      <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.08),transparent_55%)]" />
      <Container className="relative py-16 sm:py-20 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="flex flex-wrap gap-2">
              {HERO_BADGES.map((badge) => (
                <Badge key={badge}>{badge}</Badge>
              ))}
            </div>

            <h1 className="mt-8 max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Generate Your Business Sale Contract Package in Minutes
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Enter your key deal terms and instantly generate a complete package
              of business sale documents. Built for business brokers, small
              business acquisitions, and owner-led deals.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {SUPPORTED_DOCS.map((doc) => (
                <Badge key={doc} className="bg-slate-50">
                  {doc}
                </Badge>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="/dashboard" variant="primary">
                Start Free
              </Button>
              <Button href="/deals/new" variant="secondary">
                Create Sample Deal
              </Button>
            </div>

            <p className="mt-8 max-w-2xl text-sm font-medium text-slate-700">
              More than a template library — generate a complete agreement
              package from one structured deal intake.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-6">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Enter Deal Terms
                  </h3>
                  <span className="rounded-full bg-white px-2 py-1 text-[11px] font-medium text-slate-500">
                    Intake
                  </span>
                </div>

                <div className="space-y-3">
                  <Field label="Seller Name" value="Oak Street Holdings LLC" />
                  <Field label="Buyer Name" value="North Ridge Ventures LLC" />
                  <Field label="Purchase Price" value="$850,000" />
                  <Field label="Closing Date" value="06 / 30 / 2026" />
                  <Field label="Seller Financing" value="Yes — $200,000 note" />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Generated Documents
                  </h3>
                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700">
                    Ready
                  </span>
                </div>

                <div className="space-y-3">
                  <DocItem name="Asset Purchase Agreement.pdf" />
                  <DocItem name="Promissory Note.pdf" />
                  <DocItem name="Bill of Sale.pdf" />
                  <DocItem name="Non-Compete Agreement.pdf" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mb-1 text-xs font-medium text-slate-500">{label}</div>
      <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900">
        {value}
      </div>
    </div>
  );
}

function DocItem({ name }: { name: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-700">
          PDF
        </div>
        <span className="text-sm font-medium text-slate-800">{name}</span>
      </div>
      <span className="text-xs text-slate-500">Generated</span>
    </div>
  );
}