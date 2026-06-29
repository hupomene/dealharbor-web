export type WhyPactAnchorFaq = {
  id: string;
  question: string;
  shortAnswer: string;
  image: string;
  alt: string;
  category: string;
};

export const whyPactAnchorFaqs: WhyPactAnchorFaq[] = [
  {
    id: "manual-drafting",
    category: "Core Value",
    question:
      "Why should I use PactAnchor instead of drafting documents manually?",
    shortAnswer:
      "Manual drafting creates repeated data-entry work and increases the risk of inconsistent names, dates, asset lists, payment terms, and closing details across multiple documents. PactAnchor helps users enter deal information once and keep the document package aligned.",
    image: "/why-pactanchor/01-manual-drafting-vs-pactanchor.png",
    alt: "Manual drafting compared with PactAnchor synchronized document generation",
  },
  {
    id: "general-ai-tools",
    category: "AI Comparison",
    question:
      "Can’t I just use ChatGPT or Claude to generate these contracts for free?",
    shortAnswer:
      "General AI tools are useful for writing, but they are not designed for transaction-level document synchronization. PactAnchor is built around a single deal dataset so names, dates, asset lists, financing terms, and related deal details can flow consistently across the full document package.",
    image: "/why-pactanchor/02-chatgpt-vs-pactanchor.png",
    alt: "General AI tools compared with PactAnchor document synchronization",
  },
  {
    id: "broker-workflow",
    category: "Broker Workflow",
    question:
      "What problem does PactAnchor solve for small business brokers?",
    shortAnswer:
      "Small business brokers often manage buyer and seller information, asset lists, financing terms, and closing requirements under time pressure. PactAnchor helps brokers move from intake to draft package faster with fewer repetitive data-entry tasks and fewer avoidable inconsistencies.",
    image: "/why-pactanchor/03-broker-problems.png",
    alt: "PactAnchor solving small business broker document workflow problems",
  },
  {
    id: "error-reduction",
    category: "Risk Reduction",
    question:
      "How does PactAnchor reduce legal and typographical errors?",
    shortAnswer:
      "PactAnchor minimizes repeated typing by applying core deal information across related documents. This helps reduce mismatched names, incorrect dates, inconsistent purchase prices, missing asset descriptions, and conflicting payment terms.",
    image: "/why-pactanchor/04-error-reduction.png",
    alt: "PactAnchor reducing drafting errors and typographical inconsistencies",
  },
  {
    id: "document-package",
    category: "Documents",
    question: "What documents can PactAnchor help generate?",
    shortAnswer:
      "PactAnchor is designed for small business sale transactions and can help generate a coordinated draft package that may include an Asset Purchase Agreement, Bill of Sale, Promissory Note, Non-Compete Agreement, and IRS Form 8594 support materials.",
    image: "/why-pactanchor/05-document-package.png",
    alt: "PactAnchor supported document types for small business sale transactions",
  },
  {
    id: "not-only-attorneys",
    category: "Users",
    question: "Is PactAnchor only for attorneys?",
    shortAnswer:
      "No. PactAnchor is built for small business brokers, M&A advisors, transaction attorneys, CPAs, SBA loan professionals, and closing support teams. Attorneys can use it to speed up first drafts, while brokers and advisors can use it to organize deal information and prepare cleaner packages for legal review.",
    image: "/why-pactanchor/06-not-only-attorneys.png",
    alt: "Professionals who can use PactAnchor including brokers advisors attorneys and CPAs",
  },
  {
    id: "not-a-lawyer",
    category: "Legal Review",
    question: "Does PactAnchor replace a lawyer?",
    shortAnswer:
      "No. PactAnchor does not replace legal counsel. It helps users prepare structured, consistent draft documents and organize important deal information. Final legal advice, negotiation, enforceability review, and state-specific legal analysis should be handled by a qualified attorney.",
    image: "/why-pactanchor/07-not-a-lawyer.png",
    alt: "PactAnchor as a drafting tool not a replacement for a lawyer",
  },
  {
    id: "seller-financing",
    category: "Seller Financing",
    question: "How does PactAnchor help with seller financing?",
    shortAnswer:
      "Seller financing often requires careful alignment between the purchase agreement and promissory note. PactAnchor helps keep financing amounts, payment structure, dates, and related terms consistent across the relevant documents.",
    image: "/why-pactanchor/08-seller-financing.png",
    alt: "PactAnchor helping align seller financing terms across deal documents",
  },
  {
    id: "state-specific-issues",
    category: "State Issues",
    question: "Does PactAnchor support state-specific issues?",
    shortAnswer:
      "PactAnchor helps surface state-level considerations such as non-compete enforceability, notarization requirements, and transaction risk factors. Because laws vary by state and can change, final legal review should be handled by a qualified professional.",
    image: "/why-pactanchor/09-state-specific-issues.png",
    alt: "PactAnchor surfacing state-specific considerations and risk warnings",
  },
  {
    id: "closing-readiness",
    category: "Closing",
    question: "Why does PactAnchor matter at closing?",
    shortAnswer:
      "Small inconsistencies can delay closing, create confusion, or weaken trust between parties. PactAnchor helps produce a more organized, synchronized, and review-ready document package so brokers, buyers, sellers, attorneys, and closing teams can work from cleaner documents.",
    image: "/why-pactanchor/10-closing-readiness.png",
    alt: "PactAnchor improving closing readiness with synchronized document packages",
  },
];