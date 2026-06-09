import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.pactanchor.com"),
  title: "PactAnchor | AI Business Sale Document Automation",
  description:
  "Generate consistent, attorney-review-ready business sale document packages from one guided intake. PactAnchor supports Asset Purchase Agreements, Bills of Sale, Promissory Notes, Non-Compete Agreements, and Closing Checklists.",
  keywords: [
  "PactAnchor",
  "business sale document automation",
  "AI document automation",
  "business broker document automation",
  "asset purchase agreement generator",
  "bill of sale generator",
  "promissory note generator",
  "non-compete agreement",
  "small business acquisition documents",
  "attorney-review-ready documents",
  ],
  openGraph: {
    title: "PactAnchor | AI Business Sale Document Automation",
    description:
      "Generate synchronized, attorney-review-ready draft packages for small business sale transactions from one guided intake.",
    url: "https://www.pactanchor.com",
    siteName: "PactAnchor",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PactAnchor AI business sale document automation platform",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PactAnchor | AI Business Sale Document Automation",
    description:
      "AI-powered document automation for small business sale transactions.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

