import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import WorkspaceNav from "@/components/auth/workspace-nav";

type IssueReport = {
  id: string;
  deal_id: string | null;
  document_type: string | null;
  issue_type: string;
  severity: string;
  title: string;
  description: string;
  user_email: string | null;
  status: string;
  created_at: string;
};

type FeatureRequest = {
  id: string;
  deal_id: string | null;
  title: string;
  description: string;
  category: string;
  priority: string;
  requested_by_email: string | null;
  user_role: string | null;
  status: string;
  created_at: string;
};

type ProductFeedback = {
  id: string;
  deal_id: string | null;
  user_role: string | null;
  user_email: string | null;
  time_saving_rating: number | null;
  document_quality_rating: number | null;
  ease_of_use_rating: number | null;
  synchronization_value_rating: number | null;
  likelihood_to_use_again: number | null;
  likelihood_to_recommend: number | null;
  most_useful: string | null;
  most_confusing: string | null;
  improvement_suggestion: string | null;
  open_to_feedback_call: boolean;
  status: string;
  created_at: string;
};

function formatDate(value: string | null | undefined) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function truncate(value: string | null | undefined, length = 120) {
  if (!value) return "-";
  if (value.length <= length) return value;
  return `${value.slice(0, length)}...`;
}

function getAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function RatingBadge({ value }: { value: number | null }) {
  if (!value) {
    return <span className="text-slate-400">-</span>;
  }

  return (
    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
      {value}/5
    </span>
  );
}

export default async function AdminBetaFeedbackPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const adminEmails = getAdminEmails();

  if (
    adminEmails.length > 0 &&
    !adminEmails.includes((user.email ?? "").toLowerCase())
  ) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">
            Admin access required
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Your account is logged in, but this email is not listed as a
            PactAnchor admin.
          </p>
          <p className="mt-4 text-xs text-slate-500">
            Signed in as: {user.email}
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const [issuesResult, featuresResult, feedbackResult] = await Promise.all([
    supabase
      .from("issue_reports")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20),

    supabase
      .from("feature_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20),

    supabase
      .from("product_feedback")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const issueReports = (issuesResult.data ?? []) as IssueReport[];
  const featureRequests = (featuresResult.data ?? []) as FeatureRequest[];
  const productFeedback = (feedbackResult.data ?? []) as ProductFeedback[];

  const hasErrors =
    issuesResult.error || featuresResult.error || feedbackResult.error;

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">
              PactAnchor Admin
            </p>
            <h1 className="mt-2 text-3xl font-bold">
              Beta Feedback Review
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Review user-submitted issue reports, feature requests, and product
              feedback from PactAnchor launch users.
            </p>
          </div>

          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">
                PactAnchor Admin
              </p>
              <h1 className="mt-2 text-3xl font-bold">
                Beta Feedback Review
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Review user-submitted issue reports, feature requests, and product
                feedback from PactAnchor launch users.
              </p>
            </div>

            <WorkspaceNav />
          </div>
        </div>

        {hasErrors && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-semibold">Some feedback data could not be loaded.</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {issuesResult.error && <li>{issuesResult.error.message}</li>}
              {featuresResult.error && <li>{featuresResult.error.message}</li>}
              {feedbackResult.error && <li>{feedbackResult.error.message}</li>}
            </ul>
          </div>
        )}

        <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Latest Issue Reports</h2>
              <p className="mt-1 text-sm text-slate-500">
                User-reported document, calculation, download, or formatting
                issues.
              </p>
            </div>
            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
              {issueReports.length} latest
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-3">Created</th>
                  <th className="px-3 py-3">Severity</th>
                  <th className="px-3 py-3">Document</th>
                  <th className="px-3 py-3">Issue Type</th>
                  <th className="px-3 py-3">Title</th>
                  <th className="px-3 py-3">Description</th>
                  <th className="px-3 py-3">Email</th>
                  <th className="px-3 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {issueReports.length === 0 ? (
                  <tr>
                    <td className="px-3 py-6 text-slate-500" colSpan={8}>
                      No issue reports submitted yet.
                    </td>
                  </tr>
                ) : (
                  issueReports.map((item) => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="px-3 py-3 text-slate-500">
                        {formatDate(item.created_at)}
                      </td>
                      <td className="px-3 py-3">
                        <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                          {item.severity}
                        </span>
                      </td>
                      <td className="px-3 py-3">{item.document_type ?? "-"}</td>
                      <td className="px-3 py-3">{item.issue_type}</td>
                      <td className="px-3 py-3 font-semibold">
                        {truncate(item.title, 60)}
                      </td>
                      <td className="px-3 py-3 text-slate-600">
                        {truncate(item.description)}
                      </td>
                      <td className="px-3 py-3 text-slate-500">
                        {item.user_email ?? "-"}
                      </td>
                      <td className="px-3 py-3">
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Latest Feature Requests</h2>
              <p className="mt-1 text-sm text-slate-500">
                User-submitted ideas for documents, workflow, export, broker
                tools, and attorney review.
              </p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {featureRequests.length} latest
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[940px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-3">Created</th>
                  <th className="px-3 py-3">Priority</th>
                  <th className="px-3 py-3">Category</th>
                  <th className="px-3 py-3">Title</th>
                  <th className="px-3 py-3">Description</th>
                  <th className="px-3 py-3">Role</th>
                  <th className="px-3 py-3">Email</th>
                  <th className="px-3 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {featureRequests.length === 0 ? (
                  <tr>
                    <td className="px-3 py-6 text-slate-500" colSpan={8}>
                      No feature requests submitted yet.
                    </td>
                  </tr>
                ) : (
                  featureRequests.map((item) => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="px-3 py-3 text-slate-500">
                        {formatDate(item.created_at)}
                      </td>
                      <td className="px-3 py-3">
                        <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                          {item.priority}
                        </span>
                      </td>
                      <td className="px-3 py-3">{item.category}</td>
                      <td className="px-3 py-3 font-semibold">
                        {truncate(item.title, 60)}
                      </td>
                      <td className="px-3 py-3 text-slate-600">
                        {truncate(item.description)}
                      </td>
                      <td className="px-3 py-3 text-slate-500">
                        {item.user_role ?? "-"}
                      </td>
                      <td className="px-3 py-3 text-slate-500">
                        {item.requested_by_email ?? "-"}
                      </td>
                      <td className="px-3 py-3">
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Latest Product Feedback</h2>
              <p className="mt-1 text-sm text-slate-500">
                Ratings and written feedback about PactAnchor usability,
                document quality, and workflow value.
              </p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              {productFeedback.length} latest
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-3">Created</th>
                  <th className="px-3 py-3">Role</th>
                  <th className="px-3 py-3">Time</th>
                  <th className="px-3 py-3">Quality</th>
                  <th className="px-3 py-3">Ease</th>
                  <th className="px-3 py-3">Sync</th>
                  <th className="px-3 py-3">Again</th>
                  <th className="px-3 py-3">Recommend</th>
                  <th className="px-3 py-3">Most Useful</th>
                  <th className="px-3 py-3">Improvement</th>
                  <th className="px-3 py-3">Email</th>
                </tr>
              </thead>
              <tbody>
                {productFeedback.length === 0 ? (
                  <tr>
                    <td className="px-3 py-6 text-slate-500" colSpan={11}>
                      No product feedback submitted yet.
                    </td>
                  </tr>
                ) : (
                  productFeedback.map((item) => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="px-3 py-3 text-slate-500">
                        {formatDate(item.created_at)}
                      </td>
                      <td className="px-3 py-3">{item.user_role ?? "-"}</td>
                      <td className="px-3 py-3">
                        <RatingBadge value={item.time_saving_rating} />
                      </td>
                      <td className="px-3 py-3">
                        <RatingBadge value={item.document_quality_rating} />
                      </td>
                      <td className="px-3 py-3">
                        <RatingBadge value={item.ease_of_use_rating} />
                      </td>
                      <td className="px-3 py-3">
                        <RatingBadge value={item.synchronization_value_rating} />
                      </td>
                      <td className="px-3 py-3">
                        <RatingBadge value={item.likelihood_to_use_again} />
                      </td>
                      <td className="px-3 py-3">
                        <RatingBadge value={item.likelihood_to_recommend} />
                      </td>
                      <td className="px-3 py-3 text-slate-600">
                        {truncate(item.most_useful)}
                      </td>
                      <td className="px-3 py-3 text-slate-600">
                        {truncate(item.improvement_suggestion)}
                      </td>
                      <td className="px-3 py-3 text-slate-500">
                        {item.user_email ?? "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}