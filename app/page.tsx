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

export default function Home() {
  const [scan, setScan] = useState<ScanResult>(cachedSantaBarbaraScan);
  const [error, setError] = useState("");
  const [phase, setPhase] = useState<"idle" | "observing" | "done">("idle");
  const [scanFormKey, setScanFormKey] = useState(0);

  const observe = async (institution: string, targetDomain: string) => {
    const validated = validateScanInput(institution, targetDomain);
    if (!validated.ok) {
      setError(validated.error);
      return;
    }

    const hadPreviousResult = phase === "done";
    setError("");
    setPhase("observing");
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
      setPhase("done");
    } catch (cause) {
      setError(cause instanceof Error && cause.message ? cause.message : "The scan request failed.");
      setPhase(hadPreviousResult ? "done" : "idle");
    }
  };

  const clearResults = () => {
    setScan(cachedSantaBarbaraScan);
    setPhase("idle");
    setError("");
    setScanFormKey((current) => current + 1);
  };

  return (
    <main>
      <ScanAct key={scanFormKey} onObserve={observe} />
      {error ? <p role="alert">{error}</p> : null}
      <MarqueeTicker />
      <ObservationAct
        runLog={phase === "done" ? scan.runLog : []}
        phase={phase}
        onClear={clearResults}
      />
      <SurfaceAct scan={scan} findings={scan.findings} score={scan.score} />
      <VerificationAct findings={scan.findings} />
    </main>
  );
}
