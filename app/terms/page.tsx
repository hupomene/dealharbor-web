export default function TermsPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16 text-slate-800">
      <h1 className="text-3xl font-bold text-slate-950">Terms of Service</h1>

      <p className="mt-6 text-sm text-slate-600">
        Last updated: June 2026
      </p>

      <section className="mt-8 space-y-6 text-sm leading-7 text-slate-700">
        <p>
          PactAnchor is a document automation platform designed to help users
          prepare draft business sale transaction documents based on information
          provided by the user.
        </p>

        <p>
          PactAnchor is not a law firm, does not provide legal advice, and does
          not create an attorney-client relationship. Documents generated through
          PactAnchor are draft documents intended for review by qualified legal
          counsel before use or signature.
        </p>

        <p>
          You are responsible for reviewing all information entered into the
          platform and for consulting an attorney regarding the legal effect,
          enforceability, completeness, and suitability of any document generated
          through PactAnchor.
        </p>

        <p>
          PactAnchor does not guarantee that any generated document is legally
          sufficient, enforceable, or appropriate for your specific transaction,
          jurisdiction, or circumstances.
        </p>

        <p>
          By using PactAnchor, you agree that the platform is provided for
          document preparation support only and not as a substitute for legal,
          tax, accounting, brokerage, or financial advice.
        </p>
      </section>
    </main>
  );
}