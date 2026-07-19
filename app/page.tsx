/** Composes the staged Verity Lex interface from independent acts. */

"use client";

import { MarqueeTicker } from "@/components/MarqueeTicker";
import { ObservationAct } from "@/components/ObservationAct";
import { ScanAct } from "@/components/ScanAct";
import { SurfaceAct } from "@/components/SurfaceAct";
import { VerificationAct } from "@/components/VerificationAct";
import { cachedSantaBarbaraScan } from "@/data/mockScan";
import type { ScanResult } from "@/lib/types";
import { validateScanInput } from "@/lib/validate";
import { useState } from "react";

const SANTA_BARBARA_DOMAIN = "santabarbara.courts.ca.gov";

export default function Home() {
  const [scan, setScan] = useState<ScanResult>(cachedSantaBarbaraScan);
  const [error, setError] = useState("");

  const observe = async (institution: string, targetDomain: string) => {
    const validated = validateScanInput(institution, targetDomain);
    if (!validated.ok) {
      setError(validated.error);
      return;
    }

    setError("");
    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated.value),
      });
      const body = (await response.json()) as ScanResult | { error?: { message?: string } };
      if (!response.ok || !("findings" in body)) {
        throw new Error("error" in body ? body.error?.message : "The scan request failed.");
      }
      setScan(body);
    } catch (cause) {
      setError(cause instanceof Error && cause.message ? cause.message : "The scan request failed.");
    }
  };

  return (
    <main>
      <ScanAct institution={scan.institution} targetDomain={SANTA_BARBARA_DOMAIN} onObserve={observe} />
      {error ? <p role="alert">{error}</p> : null}
      <MarqueeTicker />
      <ObservationAct runLog={scan.runLog} />
      <SurfaceAct scan={scan} findings={scan.findings} score={scan.score} />
      <VerificationAct findings={scan.findings} />
    </main>
  );
}
