export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16 text-slate-800">
      <h1 className="text-3xl font-bold text-slate-950">Privacy Policy</h1>

      <p className="mt-6 text-sm text-slate-600">
        Last updated: June 2026
      </p>

      <section className="mt-8 space-y-6 text-sm leading-7 text-slate-700">
        <p>
          PactAnchor collects information you provide when creating an account,
          entering deal information, generating documents, submitting feedback,
          or completing payment through Stripe.
        </p>

        <p>
          This information may include your name, email address, transaction
          details, business sale terms, payment status, and documents generated
          through the platform.
        </p>

        <p>
          PactAnchor uses this information to operate the platform, generate
          documents, manage user access, improve product quality, and provide
          customer support.
        </p>

        <p>
          Payment processing is handled by Stripe. PactAnchor does not store your
          full credit card number or complete payment card details.
        </p>

        <p>
          PactAnchor does not sell your personal information to advertisers.
          Access to user information is limited to operational, security,
          support, and legal compliance purposes.
        </p>
      </section>
    </main>
  );
}