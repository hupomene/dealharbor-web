export type GrowthCategory =
  | "business_broker"
  | "main_street_business_broker"
  | "ma_advisor"
  | "franchise_resale_broker"
  | "business_transaction_attorney"
  | "small_business_attorney"
  | "cpa_tax_advisor"
  | "sba_loan_broker"
  | "sba_lender"
  | "escrow_closing_provider"
  | "business_broker_association"
  | "chamber_of_commerce"
  | "score_chapter"
  | "sbdc"
  | "entrepreneur_group"
  | "other"
  | "excluded";

export type GrowthFitGrade = "A" | "B" | "C" | "D";

export type GrowthSuggestedChannel =
  | "email"
  | "linkedin"
  | "contact_form"
  | "phone"
  | "partnership"
  | "manual_review"
  | "do_not_contact";

export type GrowthOutreachStatus =
  | "not_contacted"
  | "message_drafted"
  | "linkedin_drafted"
  | "email_drafted"
  | "contacted_via_linkedin"
  | "contacted_via_email"
  | "contacted_via_contact_form"
  | "replied"
  | "demo_requested"
  | "not_interested"
  | "follow_up_needed"
  | "do_not_contact"
  | "disqualified";

export type GrowthMessageType =
  | "cold_email"
  | "linkedin_connection"
  | "linkedin_followup"
  | "contact_form"
  | "partnership"
  | "follow_up_email"
  | "manual_note";

export type GrowthMessageStatus =
  | "draft"
  | "approved"
  | "sent"
  | "copied"
  | "archived"
  | "rejected";

export type GrowthLeadDashboardRow = {
  lead_id: string;
  created_at: string;
  updated_at: string;

  fit_score: number;
  fit_grade: GrowthFitGrade;
  fit_reason: string | null;
  suggested_channel: GrowthSuggestedChannel;
  outreach_status: GrowthOutreachStatus;
  last_contacted_at: string | null;
  follow_up_date: string | null;
  reply_status: string | null;
  priority: number;
  internal_notes: string | null;

  organization_id: string;
  company_name: string;
  website_url: string | null;
  website_domain: string | null;
  city: string | null;
  state: string | null;
  category: GrowthCategory;
  general_email: string | null;
  organization_phone: string | null;
  organization_linkedin_url: string | null;
  contact_page_url: string | null;

  contact_id: string | null;
  contact_name: string | null;
  contact_title: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_linkedin_url: string | null;

  search_run_id: string | null;
  keyword: string | null;
  location: string | null;
  search_provider: string | null;

  campaign_id: string | null;
  campaign_name: string | null;

  message_count: number;
  latest_cold_email_body: string | null;
  latest_cold_email_subject: string | null;
  latest_linkedin_message_body: string | null;
  latest_linkedin_followup_body: string | null;
  latest_contact_form_body: string | null;
  latest_partnership_message_body: string | null;
};

export type GrowthDashboardSummary = {
  total: number;
  gradeA: number;
  gradeB: number;
  gradeC: number;
  gradeD: number;
  notContacted: number;
  messageDrafted: number;
  contacted: number;
  replied: number;
  demoRequested: number;
  followUpNeeded: number;
  doNotContact: number;
};

export type GrowthSearchRunDashboardRow = {
  id: string;
  campaign_id: string | null;
  keyword: string;
  location: string | null;
  category_filter: GrowthCategory | null;
  search_provider: string;
  search_query: string | null;
  max_results: number;
  status: "queued" | "running" | "completed" | "failed" | "cancelled";
  started_at: string | null;
  completed_at: string | null;
  total_found: number;
  total_saved: number;
  total_duplicates: number;
  total_errors: number;
  error_message: string | null;
  raw_response: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export type GrowthAnalysisJobStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export type GrowthAnalysisJobDashboardRow = {
  id: string;
  lead_id: string;
  campaign_id: string | null;
  search_run_id: string | null;
  job_type: string;
  status: GrowthAnalysisJobStatus;
  priority: number;
  attempt_count: number;
  max_attempts: number;
  locked_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  result: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type GrowthOutreachEventDashboardRow = {
  id: string;
  lead_id: string;
  event_type: string;
  channel: string | null;
  event_notes: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};