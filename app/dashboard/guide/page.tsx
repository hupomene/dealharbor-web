import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { requirePaidAccessProfile } from "@/lib/access-control";
import WorkspaceNav from "@/components/auth/workspace-nav";

const guideSteps = [
  {
    title: "Step 1 — Create a Deal",
    text: "Start by creating a new business sale deal. Enter the business name, purchase price, and down payment carefully. For Single Deal Package users, these core deal identity fields are locked after creation.",
  },
  {
    title: "Step 2 — Complete Core Deal Info",
    text: "Add the business type, location, closing method, agreement date, and closing date. These terms help PactAnchor keep the document package consistent across multiple documents.",
  },
  {
    title: "Step 3 — Add Buyer and Seller Information",
    text: "Enter the legal names, addresses, organization states, and related party information for the buyer and seller. These details flow into the transaction documents.",
  },
  {
    title: "Step 4 — Enter Assets and Exclusions",
    text: "List included assets, excluded assets, and excluded liabilities. This helps the Asset Purchase Agreement and Bill of Sale stay aligned.",
  },
  {
    title: "Step 5 — Enter Payment and Seller Financing Terms",
    text: "Review the cash at closing, down payment, seller financing amount, promissory note terms, interest rate, maturity date, and payment schedule.",
  },
  {
    title: "Step 6 — Add Non-Compete Terms",
    text: "If applicable, enter the non-compete term, restricted radius, business address, and allocation amount. These terms help generate a more complete Non-Compete Agreement.",
  },
  {
    title: "Step 7 — Generate Documents",
    text: "Use the document generation panel to create the draft package, including Asset Purchase Agreement, Bill of Sale, Promissory Note, Non-Compete Agreement, IRS allocation summary, and related closing materials when available.",
  },
  {
    title: "Step 8 — Review with Attorney",
    text: "PactAnchor prepares attorney-review-ready draft packages. Before signing or relying on any document, have the draft reviewed by a qualified attorney.",
  },
];

export default async function DashboardGuidePage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard/guide");
  }

  const accessProfile = await requirePaidAccessProfile({
    supabase,
    user,
  });

  return (
    <main className="min-h-screen bg-slate-50 px-8 py-10 text-slate-900">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">PactAnchor Workspace</p>
            <h1 className="text-5xl font-semibold tracking-tight text-slate-900">
              How to Use PactAnchor
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
              Use this guide to move from deal intake to a synchronized
              attorney-review-ready business sale document package.
            </p>
          </div>

          <WorkspaceNav />
        </div>

        <section className="mb-10 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">
                Getting Started
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                One guided intake. Multiple synchronized documents.
              </h2>

              <p className="mt-4 text-base leading-7 text-slate-600">
                PactAnchor helps buyers, sellers, brokers, advisors, and
                attorneys prepare cleaner first-draft business sale document
                packages. Enter deal information once, review the transaction
                terms, and generate coordinated draft documents for attorney
                review.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <p className="text-sm font-semibold text-slate-950">
                Current access
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-950">
                {accessProfile.planLabel}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                Your plan determines whether you can create one deal package or
                manage multiple deal workflows.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-5">
          {guideSteps.map((step) => (
            <div
              key={step.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-xl font-bold text-slate-950">
                {step.title}
              </h3>
              <p className="mt-3 text-base leading-7 text-slate-600">
                {step.text}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-10 rounded-3xl border border-amber-200 bg-amber-50 p-7">
          <h2 className="text-2xl font-bold text-slate-950">
            Important legal note
          </h2>

          <p className="mt-3 text-base leading-7 text-slate-700">
            PactAnchor prepares attorney-review-ready draft transaction
            documents. PactAnchor is not a law firm, does not provide legal
            advice, and does not replace attorney review. You should consult a
            qualified attorney before signing or relying on any generated
            document.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/deals/new"
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Create New Deal
            </Link>

            <Link
              href="/deals"
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              View My Deals
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}