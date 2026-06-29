import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/growth/growth-db";
import type { GrowthOutreachStatus } from "@/types/growth";
import { requireGrowthAdmin } from "@/lib/growth/growth-auth";

const VALID_STATUSES: GrowthOutreachStatus[] = [
  "not_contacted",
  "message_drafted",
  "linkedin_drafted",
  "email_drafted",
  "contacted_via_linkedin",
  "contacted_via_email",
  "contacted_via_contact_form",
  "replied",
  "demo_requested",
  "not_interested",
  "follow_up_needed",
  "do_not_contact",
  "disqualified",
];

function getEventTypeFromStatus(status: GrowthOutreachStatus) {
  switch (status) {
    case "contacted_via_email":
      return "email_sent";
    case "contacted_via_linkedin":
      return "linkedin_sent_manually";
    case "contacted_via_contact_form":
      return "contact_form_submitted_manually";
    case "replied":
      return "reply_received";
    case "demo_requested":
      return "demo_requested";
    case "follow_up_needed":
      return "follow_up_scheduled";
    case "not_interested":
      return "not_interested";
    case "do_not_contact":
      return "marked_do_not_contact";
    case "disqualified":
      return "disqualified";
    default:
      return "prospect_updated";
  }
}

function getChannelFromStatus(status: GrowthOutreachStatus) {
  switch (status) {
    case "contacted_via_email":
      return "email";
    case "contacted_via_linkedin":
      return "linkedin";
    case "contacted_via_contact_form":
      return "contact_form";
    default:
      return "manual";
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ leadId: string }> }
) {
  const auth = await requireGrowthAdmin(request);

  if (!auth.ok) {
    return auth.response;
  }

  const { leadId } = await context.params;

  try {
    const body = await request.json();

    const status = body.status as GrowthOutreachStatus | undefined;
    const followUpDate =
      typeof body.follow_up_date === "string" && body.follow_up_date
        ? body.follow_up_date
        : null;
    const internalNotes =
      typeof body.internal_notes === "string" ? body.internal_notes : null;
    const eventNotes =
      typeof body.event_notes === "string" && body.event_notes.trim()
        ? body.event_notes.trim()
        : null;

    if (!leadId) {
      return NextResponse.json(
        { error: "Missing lead id" },
        { status: 400 }
      );
    }

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: "Invalid outreach status" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdminClient();

    const updatePayload: Record<string, string | null> = {
      outreach_status: status,
      updated_at: new Date().toISOString(),
    };

    if (
      status === "contacted_via_email" ||
      status === "contacted_via_linkedin" ||
      status === "contacted_via_contact_form"
    ) {
      updatePayload.last_contacted_at = new Date().toISOString();
    }

    if (status === "follow_up_needed") {
      updatePayload.follow_up_date = followUpDate;
    } else if (followUpDate !== null) {
      updatePayload.follow_up_date = followUpDate;
    }

    if (internalNotes !== null) {
      updatePayload.internal_notes = internalNotes;
    }

    const { data: updatedLead, error: updateError } = await supabase
      .from("growth_leads")
      .update(updatePayload)
      .eq("id", leadId)
      .select(
        `
        id,
        outreach_status,
        follow_up_date,
        internal_notes,
        updated_at,
        growth_organizations (
          company_name,
          website_domain,
          general_email
        ),
        growth_contacts (
          email
        )
        `
      )
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    const { error: eventError } = await supabase
      .from("growth_outreach_events")
      .insert({
        lead_id: leadId,
        event_type: getEventTypeFromStatus(status),
        channel: getChannelFromStatus(status),
        event_notes:
          eventNotes ??
          `Lead status changed to ${status}${
            followUpDate ? ` with follow-up date ${followUpDate}` : ""
          }`,
        metadata: {
          status,
          follow_up_date: followUpDate,
          internal_notes_updated: internalNotes !== null,
          source: "admin_growth_dashboard",
        },
      });

    if (eventError) {
      console.error("Failed to create outreach event:", eventError);
    }

    if (status === "do_not_contact") {
      const organization = Array.isArray(updatedLead.growth_organizations)
        ? updatedLead.growth_organizations[0]
        : updatedLead.growth_organizations;

      const contact = Array.isArray(updatedLead.growth_contacts)
        ? updatedLead.growth_contacts[0]
        : updatedLead.growth_contacts;

      const companyName = organization?.company_name ?? null;
      const domain = organization?.website_domain ?? null;
      const email = contact?.email ?? organization?.general_email ?? null;

      const { error: dncError } = await supabase
        .from("growth_do_not_contact")
        .insert({
          company_name: companyName,
          domain,
          email,
          reason: "manual_admin_request",
          notes:
            eventNotes ??
            "Marked as Do Not Contact from Growth Admin dashboard.",
        });

      if (dncError) {
        console.error("Failed to create do-not-contact record:", dncError);
      }
    }

    return NextResponse.json({
      success: true,
      lead: updatedLead,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}