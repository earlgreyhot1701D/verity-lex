/** Defines global document metadata and the Verity Lex page shell. */

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Verity Lex",
  description:
    "An observational, cited surface of public evidence for institutional AI readiness.",
  other: {
    "codex-preview": "development",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
