import type { Metadata } from "next";
import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://www.pactanchor.com"),
  title: "PactAnchor | Business Sale Document Automation",
  description:
    "PactAnchor is an AI-powered document automation platform for small business sale transactions. Enter deal terms once and generate synchronized draft packages for attorney review.",
  openGraph: {
    title: "PactAnchor | Business Sale Document Automation",
    description:
      "AI-powered document automation for small business sale transactions. Enter deal terms once and generate synchronized draft packages for attorney review.",
    url: "https://www.pactanchor.com",
    siteName: "PactAnchor",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PactAnchor | Business Sale Document Automation",
    description:
      "AI-powered document automation for small business sale transactions.",
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