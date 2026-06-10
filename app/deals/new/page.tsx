import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import NewDealForm from "./new-deal-form";
import { requirePaidAccess } from "@/lib/access-control";
import WorkspaceNav from "@/components/auth/workspace-nav";

export default async function NewDealPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/deals/new");
  }

  await requirePaidAccess({
    supabase,
    user,
  });

  return (
    <main className="min-h-screen bg-slate-50 px-8 py-10 text-slate-900">
      <div className="mx-auto max-w-6xl">
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

          <WorkspaceNav showNewDeal={false} />
        </div>

        <NewDealForm />
      </div>
    </main>
  );
}