import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/growth/growth-db";
import { analyzeWebsite } from "@/lib/growth/website-analyzer";
import { normalizeDomain } from "@/lib/growth/domain-normalizer";
import { analyzeLeadForGrowth } from "@/lib/growth/lead-ai-analyzer";
import { requireGrowthAdmin } from "@/lib/growth/growth-auth";

type LeadForAnalysis = {
  id: string;
  category: string;
  fit_score: number;
  fit_grade: string;
  fit_reason: string | null;
  fit_signals: Record<string, unknown> | null;
  suggested_channel: string;
  outreach_status: string;
  organization_id: string;
  contact_id: string | null;
  search_run_id: string | null;
  campaign_id: string | null;
  growth_organizations: {
    id: string;
    company_name: string;
    website_url: string | null;
    website_domain: string | null;
    city: string | null;
    state: string | null;
    category: string;
    general_email: string | null;
    phone: string | null;
    linkedin_url: string | null;
    contact_page_url: string | null;
    website_title: string | null;
    website_meta_description: string | null;
    analyzed_homepage_text: string | null;
  } | null;
  growth_contacts: {
    id: string;
    contact_name: string | null;
    contact_title: string | null;
    email: string | null;
    phone: string | null;
    linkedin_url: string | null;
  } | null;
  growth_search_runs: {
    id: string;
    keyword: string;
    location: string | null;
    search_query: string | null;
  } | null;
};

function getGradeFromScore(score: number) {
  if (score >= 80) return "A";
  if (score >= 65) return "B";
  if (score >= 40) return "C";
  return "D";
}

function getFallbackFitReason(companyName: string) {
  return `${companyName} was analyzed from its website and search context. AI scoring may have used fallback logic if the model was unavailable.`;
}

function getMessageStatusFromChannel(channel: string) {
  if (channel === "email") return "email_drafted";
  if (channel === "linkedin") return "linkedin_drafted";
  return "message_drafted";
}

export async function POST(
  request: Request,
  context: { params: Promise<{ leadId: string }> }
) {

  const auth = await requireGrowthAdmin(request);

  if (!auth.ok) {
    return auth.response;
  }

  const { leadId } = await context.params;

  if (!leadId) {
    return NextResponse.json({ error: "Missing lead id" }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();

  try {
    const { data: lead, error: leadError } = await supabase
      .from("growth_leads")
      .select(
        `
        id,
        category,
        fit_score,
        fit_grade,
        fit_reason,
        fit_signals,
        suggested_channel,
        outreach_status,
        organization_id,
        contact_id,
        search_run_id,
        campaign_id,
        growth_organizations (
          id,
          company_name,
          website_url,
          website_domain,
          city,
          state,
          category,
          general_email,
          phone,
          linkedin_url,
          contact_page_url,
          website_title,
          website_meta_description,
          analyzed_homepage_text
        ),
        growth_contacts (
          id,
          contact_name,
          contact_title,
          email,
          phone,
          linkedin_url
        ),
        growth_search_runs (
          id,
          keyword,
          location,
          search_query
        )
        `
      )
      .eq("id", leadId)
      .single();

    if (leadError || !lead) {
      return NextResponse.json(
        { error: leadError?.message ?? "Lead not found" },
        { status: 404 }
      );
    }

    const currentLead = lead as unknown as LeadForAnalysis;
    const organization = currentLead.growth_organizations;

    if (!organization) {
      return NextResponse.json(
        { error: "Lead organization not found" },
        { status: 404 }
      );
    }

    if (!organization.website_url) {
      return NextResponse.json(
        { error: "Organization does not have a website URL" },
        { status: 400 }
      );
    }

    let websiteAnalysis: Awaited<ReturnType<typeof analyzeWebsite>> | null =
      null;

    try {
      websiteAnalysis = await analyzeWebsite(organization.website_url);
    } catch {
      websiteAnalysis = null;
    }

    const discoveredEmails = websiteAnalysis?.discoveredEmails ?? [];
    const discoveredPhones = websiteAnalysis?.discoveredPhones ?? [];
    const discoveredLinkedinUrls =
      websiteAnalysis?.discoveredLinkedinUrls ?? [];

    const websiteDomain =
      organization.website_domain ??
      normalizeDomain(organization.website_url) ??
      null;

    const locationText = [organization.city, organization.state]
      .filter(Boolean)
      .join(", ");

    const searchQuery =
      currentLead.growth_search_runs?.search_query ??
      currentLead.growth_search_runs?.keyword ??
      "";

    const aiAnalysis = await analyzeLeadForGrowth({
      companyName: organization.company_name,
      websiteUrl: websiteAnalysis?.websiteUrl ?? organization.website_url,
      websiteDomain,
      location: locationText || currentLead.growth_search_runs?.location || null,
      categoryHint: currentLead.category,
      searchQuery,
      searchTitle: organization.website_title ?? organization.company_name,
      searchSnippet: organization.website_meta_description,
      websiteTitle:
        websiteAnalysis?.websiteTitle ?? organization.website_title ?? null,
      websiteMetaDescription:
        websiteAnalysis?.websiteMetaDescription ??
        organization.website_meta_description ??
        null,
      homepageText:
        websiteAnalysis?.analyzedHomepageText ??
        organization.analyzed_homepage_text ??
        null,
      discoveredEmails,
      discoveredPhones,
      discoveredLinkedinUrls,
      existingContactName: currentLead.growth_contacts?.contact_name ?? null,
      existingContactTitle: currentLead.growth_contacts?.contact_title ?? null,
      existingEmail:
        currentLead.growth_contacts?.email ?? organization.general_email ?? null,
      existingPhone: currentLead.growth_contacts?.phone ?? organization.phone ?? null,
      existingLinkedinUrl:
        currentLead.growth_contacts?.linkedin_url ??
        organization.linkedin_url ??
        null,
    });

    const contactPerson = aiAnalysis.contactPerson;
    const aiFit = aiAnalysis.fit;

    const contactName =
      currentLead.growth_contacts?.contact_name ?? contactPerson.contactName;

    const contactTitle =
      currentLead.growth_contacts?.contact_title ?? contactPerson.contactTitle;

    const primaryEmail =
      contactPerson.email ??
      currentLead.growth_contacts?.email ??
      organization.general_email ??
      discoveredEmails[0] ??
      null;

    const primaryPhone =
      contactPerson.phone ??
      currentLead.growth_contacts?.phone ??
      organization.phone ??
      discoveredPhones[0] ??
      null;

    const primaryLinkedIn =
      contactPerson.linkedinUrl ??
      currentLead.growth_contacts?.linkedin_url ??
      organization.linkedin_url ??
      discoveredLinkedinUrls[0] ??
      null;

    const fallbackGrade = getGradeFromScore(currentLead.fit_score ?? 45);
    const finalFitGrade = aiFit.fit_grade || fallbackGrade;
    const finalFitScore = aiFit.fit_score ?? currentLead.fit_score ?? 45;
    const finalFitReason =
      aiFit.fit_reason || getFallbackFitReason(organization.company_name);

    const suggestedChannel = aiFit.suggested_channel;

    let contactId = currentLead.contact_id;

    if (!contactId && primaryEmail) {
      const { data: existingContact } = await supabase
        .from("growth_contacts")
        .select("id")
        .ilike("email", primaryEmail)
        .limit(1);

      if (existingContact && existingContact.length > 0) {
        contactId = existingContact[0].id;
      } else {
        const { data: insertedContact } = await supabase
          .from("growth_contacts")
          .insert({
            organization_id: organization.id,
            contact_name: contactName,
            contact_title: contactTitle,
            email: primaryEmail,
            phone: primaryPhone,
            linkedin_url: primaryLinkedIn,
            is_primary: true,
            source_url:
              websiteAnalysis?.contactPageUrl ?? organization.website_url,
            notes: `Contact generated from Analyze Lead action. Person extraction confidence: ${contactPerson.confidence}. ${contactPerson.reason}`,
            email_confidence: primaryEmail ? contactPerson.confidence || 70 : null,
            linkedin_confidence: primaryLinkedIn
              ? contactPerson.confidence || 70
              : null,
          })
          .select("id")
          .single();

        if (insertedContact) {
          contactId = insertedContact.id;
        }
      }
    }

    if (contactId) {
      await supabase
        .from("growth_contacts")
        .update({
          contact_name: contactName,
          contact_title: contactTitle,
          email: primaryEmail,
          phone: primaryPhone,
          linkedin_url: primaryLinkedIn,
          source_url:
            websiteAnalysis?.contactPageUrl ?? organization.website_url,
          notes: `Updated from Analyze Lead action. Person extraction confidence: ${contactPerson.confidence}. ${contactPerson.reason}`,
          email_confidence: primaryEmail ? contactPerson.confidence || 70 : null,
          linkedin_confidence: primaryLinkedIn
            ? contactPerson.confidence || 70
            : null,
        })
        .eq("id", contactId);
    }

    await supabase
      .from("growth_organizations")
      .update({
        website_url: websiteAnalysis?.websiteUrl ?? organization.website_url,
        website_domain: websiteDomain,
        category: aiFit.category,
        general_email: primaryEmail,
        phone: primaryPhone,
        linkedin_url: primaryLinkedIn,
        contact_page_url:
          websiteAnalysis?.contactPageUrl ?? organization.contact_page_url,
        website_title:
          websiteAnalysis?.websiteTitle ?? organization.website_title,
        website_meta_description:
          websiteAnalysis?.websiteMetaDescription ??
          organization.website_meta_description,
        analyzed_homepage_text:
          websiteAnalysis?.analyzedHomepageText ??
          organization.analyzed_homepage_text,
        discovered_emails: discoveredEmails,
        discovered_phones: discoveredPhones,
        discovered_linkedin_urls: discoveredLinkedinUrls,
        notes: websiteAnalysis
          ? "Website analyzer completed from Analyze Lead action."
          : "Analyze Lead action ran, but website analyzer failed or was blocked.",
        updated_at: new Date().toISOString(),
      })
      .eq("id", organization.id);

    const leadUpdatePayload = {
      contact_id: contactId,
      category: aiFit.category,
      fit_score: finalFitScore,
      fit_grade: finalFitGrade,
      fit_reason: finalFitReason,
      fit_signals: {
        source: "combined_lead_ai_analyzer",
        website_analyzed: Boolean(websiteAnalysis),
        ai_scored: !aiAnalysis.usedFallback,
        ai_mode: "combined_contact_fit_messages",
        ai_model: aiAnalysis.model,
        contact_person_extracted: Boolean(contactName),
        contact_person_is_person_level: contactPerson.isPersonLevel,
        contact_person_confidence: contactPerson.confidence,
        contact_person_reason: contactPerson.reason,
        discovered_email_count: discoveredEmails.length,
        discovered_phone_count: discoveredPhones.length,
        discovered_linkedin_count: discoveredLinkedinUrls.length,
        ai_positive: aiFit.fit_signals.positive,
        ai_negative: aiFit.fit_signals.negative,
        ai_document_relevance: aiFit.fit_signals.document_relevance,
        ai_icp_match: aiFit.fit_signals.icp_match,
        ai_risks: aiFit.fit_signals.risks,
        exclude_reason: aiFit.exclude_reason,
      },
      suggested_channel: suggestedChannel,
      outreach_status:
        aiFit.category === "excluded" ||
        aiFit.suggested_channel === "do_not_contact"
          ? "disqualified"
          : getMessageStatusFromChannel(suggestedChannel),
      internal_notes: websiteAnalysis
        ? "Analyze Lead completed. Website analyzer, AI fit scorer, and outreach drafts generated."
        : "Analyze Lead completed with website analyzer fallback. AI fit scorer and outreach drafts generated.",
      updated_at: new Date().toISOString(),
    };

    const { error: updateLeadError } = await supabase
      .from("growth_leads")
      .update(leadUpdatePayload)
      .eq("id", leadId);

    if (updateLeadError) {
      return NextResponse.json(
        { error: updateLeadError.message },
        { status: 500 }
      );
    }

    let messagesGenerated = 0;

    if (
      aiFit.category !== "excluded" &&
      aiFit.suggested_channel !== "do_not_contact"
    ) {
      const generatedMessages = aiAnalysis.messages;

      await supabase.from("growth_messages").delete().eq("lead_id", leadId);

      const messageRows = [
        {
          lead_id: leadId,
          message_type: "cold_email",
          channel: "email",
          subject: generatedMessages.cold_email_subject,
          body: generatedMessages.cold_email_body,
          status: "draft",
          version: 1,
          generated_by_model: aiAnalysis.usedFallback ? "fallback" : aiAnalysis.model,
          prompt_version: "growth_message_v1",
          personalization_summary: generatedMessages.personalization_summary,
        },
        {
          lead_id: leadId,
          message_type: "linkedin_connection",
          channel: "linkedin",
          subject: null,
          body: generatedMessages.linkedin_connection_message,
          status: "draft",
          version: 1,
          generated_by_model: aiAnalysis.usedFallback ? "fallback" : aiAnalysis.model,
          prompt_version: "growth_message_v1",
          personalization_summary: generatedMessages.personalization_summary,
        },
        {
          lead_id: leadId,
          message_type: "linkedin_followup",
          channel: "linkedin",
          subject: null,
          body: generatedMessages.linkedin_followup_message,
          status: "draft",
          version: 1,
          generated_by_model: aiAnalysis.usedFallback ? "fallback" : aiAnalysis.model,
          prompt_version: "growth_message_v1",
          personalization_summary: generatedMessages.personalization_summary,
        },
        {
          lead_id: leadId,
          message_type: "contact_form",
          channel: "contact_form",
          subject: null,
          body: generatedMessages.contact_form_message,
          status: "draft",
          version: 1,
          generated_by_model: aiAnalysis.usedFallback ? "fallback" : aiAnalysis.model,
          prompt_version: "growth_message_v1",
          personalization_summary: generatedMessages.personalization_summary,
        },
        {
          lead_id: leadId,
          message_type: "partnership",
          channel: "email",
          subject: "Potential PactAnchor partnership",
          body: generatedMessages.partnership_message,
          status: "draft",
          version: 1,
          generated_by_model: aiAnalysis.usedFallback ? "fallback" : aiAnalysis.model,
          prompt_version: "growth_message_v1",
          personalization_summary: generatedMessages.personalization_summary,
        },
      ];

      const { error: messageError } = await supabase
        .from("growth_messages")
        .insert(messageRows);

      if (messageError) {
        return NextResponse.json(
          { error: messageError.message },
          { status: 500 }
        );
      }

      messagesGenerated = messageRows.length;
    }

    await supabase.from("growth_outreach_events").insert({
      lead_id: leadId,
      event_type: "fit_scored",
      channel: "system",
      event_notes: `Analyze Lead completed. Messages generated: ${messagesGenerated}`,
      metadata: {
        website_analyzed: Boolean(websiteAnalysis),
        ai_mode: "combined_contact_fit_messages",
        ai_model: aiAnalysis.model,
        ai_used_fallback: aiAnalysis.usedFallback,
        contact_person_extracted: Boolean(contactName),
        contact_person_is_person_level: contactPerson.isPersonLevel,
        contact_person_confidence: contactPerson.confidence,
        fit_score: finalFitScore,
        fit_grade: finalFitGrade,
        suggested_channel: suggestedChannel,
        messages_generated: messagesGenerated,
      },
    });

    return NextResponse.json({
      success: true,
      leadId,
      websiteAnalyzed: Boolean(websiteAnalysis),
      fitScore: finalFitScore,
      fitGrade: finalFitGrade,
      suggestedChannel,
      messagesGenerated,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}