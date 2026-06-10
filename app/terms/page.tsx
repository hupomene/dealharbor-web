export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-800">
      <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">
          PactAnchor Legal
        </p>

        <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950">
          Terms of Service
        </h1>

        <p className="mt-4 text-sm text-slate-500">
          Last updated: June 2026
        </p>

        <div className="mt-10 space-y-8 text-sm leading-7 text-slate-700">
          <section>
            <h2 className="text-lg font-semibold text-slate-950">
              1. Overview
            </h2>
            <p className="mt-3">
              PactAnchor is a document automation platform designed to help users
              prepare draft document packages for small business sale transactions
              based on information provided by the user.
            </p>
            <p className="mt-3">
              PactAnchor is operated by Covenant AI Solutions LLC.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-950">
              2. No Legal Advice
            </h2>
            <p className="mt-3">
              PactAnchor is not a law firm, does not provide legal advice, and
              does not create an attorney-client relationship. Any documents,
              summaries, suggestions, or outputs generated through PactAnchor are
              provided for document preparation support only.
            </p>
            <p className="mt-3">
              You should consult a qualified attorney before using, signing, or
              relying on any document generated through PactAnchor.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-950">
              3. User Responsibility
            </h2>
            <p className="mt-3">
              You are responsible for the accuracy, completeness, and legality of
              all information you enter into PactAnchor. You are also responsible
              for reviewing all generated documents and determining whether they
              are appropriate for your transaction, jurisdiction, and
              circumstances.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-950">
              4. Document Outputs
            </h2>
            <p className="mt-3">
              PactAnchor may generate draft documents such as asset purchase
              agreements, bills of sale, promissory notes, non-compete
              agreements, allocation summaries, and related transaction
              materials. These documents are drafts and should be reviewed by
              qualified legal counsel before use.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-950">
              5. No Guarantee
            </h2>
            <p className="mt-3">
              PactAnchor does not guarantee that any generated document is
              legally sufficient, enforceable, complete, accurate, or suitable
              for any particular transaction, jurisdiction, or purpose.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-950">
              6. Payment and Access
            </h2>
            <p className="mt-3">
              Paid access may be provided through one-time packages,
              subscriptions, early access plans, or other pricing options
              offered by PactAnchor. Payment processing may be handled by third
              party providers such as Stripe.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-950">
              7. Limitation of Liability
            </h2>
            <p className="mt-3">
              To the maximum extent permitted by law, PactAnchor and Covenant AI
              Solutions LLC are not liable for any damages, losses, claims, or
              disputes arising from your use of the platform, generated
              documents, transaction decisions, or reliance on any output from the
              service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-950">
              8. Changes to These Terms
            </h2>
            <p className="mt-3">
              PactAnchor may update these Terms of Service from time to time.
              Continued use of the platform after changes are posted means you
              accept the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-950">
              9. Contact
            </h2>
            <p className="mt-3">
              For questions about these Terms of Service, contact PactAnchor, operated by Covenant AI Solutions LLC, at info@pactanchor.com.
            </p>
          </section>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6">
          <a href="/" className="text-sm font-semibold text-slate-950 underline">
            Return to PactAnchor
          </a>
        </div>
      </div>
    </main>
  );
}