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
    "Everyone is selling AI to government. Verity Lex reads a court's public record and returns an AI-readiness score anyone can recompute. The AI reads. It never scores.",
  icons: {
    icon: "/images/favicon.png",
    apple: "/images/favicon.png",
  },
  openGraph: {
    title: "Verity Lex",
    description:
      "Everyone is selling AI to government. Verity Lex reads a court's public record and returns an AI-readiness score anyone can recompute. The AI reads. It never scores.",
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
      "Everyone is selling AI to government. Verity Lex reads a court's public record and returns an AI-readiness score anyone can recompute. The AI reads. It never scores.",
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
