import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import DealDetailForm from "./deal-detail-form";
import { requirePaidAccess } from "@/lib/access-control";

type PageProps = {
  params: Promise<{
    dealId: string;
  }>;
};

export default async function DealDetailPage({ params }: PageProps) {
  const { dealId } = await params;

  if (!dealId) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl px-6 py-8">
          <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-red-700">Missing deal ID.</p>
            <Link
              href="/deals"
              className="mt-4 inline-block text-sm font-medium text-slate-900 underline underline-offset-2"
            >
              Back to Deals
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/deals/${dealId}`);
  }

  await requirePaidAccess({ supabase, user });
  
  const { data, error } = await supabase
    .from("deals")
    .select("*")
    .eq("id", dealId)
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl px-6 py-8">
          <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-red-700">
              {error?.message ?? "Deal not found."}
            </p>
            <Link
              href="/deals"
              className="mt-4 inline-block text-sm font-medium text-slate-900 underline underline-offset-2"
            >
              Back to Deals
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return <DealDetailForm deal={data} />;
}