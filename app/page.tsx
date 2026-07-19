/** Composes the staged Verity Lex interface from independent acts. */

"use client";

import { MarqueeTicker } from "@/components/MarqueeTicker";
import { ObservationAct } from "@/components/ObservationAct";
import { ScanAct } from "@/components/ScanAct";
import { SurfaceAct } from "@/components/SurfaceAct";
import { VerificationAct } from "@/components/VerificationAct";
import { cachedSantaBarbaraScan } from "@/data/mockScan";
import type { ScanResult } from "@/lib/types";
import { useState } from "react";

const SANTA_BARBARA_DOMAIN = "santabarbara.courts.ca.gov";
const DOMAIN_PATTERN = /^(?=.{1,253}$)(?:[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?\.)+[a-z](?:[a-z\d-]{0,61}[a-z\d])?$/i;

export default function Home() {
  const [scan, setScan] = useState<ScanResult>(cachedSantaBarbaraScan);
  const [error, setError] = useState("");

  const observe = async (institution: string, targetDomain: string) => {
    const validationError = validateInputs(institution, targetDomain);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ institution: institution.trim(), targetDomain: targetDomain.trim() }),
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
      <SurfaceAct findings={scan.findings} score={scan.score} />
      <VerificationAct findings={scan.findings} />
    </main>
  );
}

function validateInputs(institution: string, targetDomain: string): string {
  if (institution.trim().length === 0) {
    return "Enter an institution before observing its public record.";
  }
  if (!DOMAIN_PATTERN.test(targetDomain.trim())) {
    return "Enter a valid target domain without a protocol or path.";
  }
  return "";
}
