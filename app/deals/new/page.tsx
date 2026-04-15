import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import NewDealForm from "./new-deal-form";

export default async function NewDealPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/deals/new");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-8 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">PactAnchor Workspace</p>
            <h1 className="text-5xl font-semibold tracking-tight text-slate-900">
              Create New Deal
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Start a new business sale deal and continue to the full contract
              drafting workspace.
            </p>
          </div>

          <Link
            href="/deals"
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Back to Deals
          </Link>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <NewDealForm />
        </section>
      </div>
    </main>
  );
}