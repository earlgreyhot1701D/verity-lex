/** Defines global document metadata and the Verity Lex page shell. */

import type { Metadata } from "next";
import "./globals.css";

const metadataBase = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? new URL(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`)
  : new URL("http://localhost:3000");

export const metadata: Metadata = {
  metadataBase,
  title: "Verity Lex",
  description:
    "An observational, cited surface of public evidence for institutional AI readiness.",
  icons: {
    icon: "/images/favicon.png",
    apple: "/images/favicon.png",
  },
  openGraph: {
    title: "Verity Lex",
    description:
      "An observational, cited surface of public evidence for institutional AI readiness.",
    type: "website",
    images: [
      {
        url: "/images/social-card.png",
        width: 1730,
        height: 909,
        alt: "Verity Lex — see a court on the record",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Verity Lex",
    description:
      "An observational, cited surface of public evidence for institutional AI readiness.",
    images: ["/images/social-card.png"],
  },
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
