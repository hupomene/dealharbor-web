import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DealHarbor | Business Sale Contract Automation",
  description:
    "Generate business sale contract packages from structured deal inputs. Built for brokers, acquisitions, and owner-led deals.",
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