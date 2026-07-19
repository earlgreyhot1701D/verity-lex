/** One finding as a card: Found / Not-located / Verified, with citation and pips. */

"use client";

import registryData from "@/data/registry.v1.json";
import type { Finding } from "@/lib/types";
import styles from "@/styles/readiness-register.module.css";
import { useState } from "react";

interface RegistryArtifact {
  id: string;
  name: string;
  authority: { name: string; citation: string };
  tier: "required" | "recommended";
  elements?: string[];
}

const artifacts = (registryData as { artifacts: RegistryArtifact[] }).artifacts;

const humanize = (id: string) =>
  id.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

const fileName = (url: string) => url.split("/").pop() || url;

export function FindingCard({ finding }: { finding: Finding }) {
  const [showFullPassage, setShowFullPassage] = useState(false);
  const artifact = artifacts.find((item) => item.id === finding.artifactId);
  const meta = artifact ? {
    name: artifact.name,
    authority: `${artifact.authority.citation} · ${artifact.tier === "required" ? "Required" : "Recommended"}`,
    category: artifact.authority.name,
  } : {
    name: humanize(finding.artifactId),
    authority: "",
    category: "Unregistered artifact",
  };
  const elementsTotal = artifact?.elements?.length ?? 0;
  const badge =
    finding.status === "verified"
      ? "VERIFIED"
      : finding.status === "not_located"
        ? "NOT LOCATED · UNVERIFIED"
        : "FOUND";
  const badgeClass =
    finding.status === "verified"
      ? `${styles.badge} ${styles.badgeVer}`
      : finding.status === "not_located"
        ? `${styles.badge} ${styles.badgeNot}`
        : styles.badge;

  return (
    <article className={styles.findingCard}>
      <div className={`${styles.findingTop} ${styles.mono}`}>
        <span>{meta.category}</span>
        <span className={badgeClass}>{badge}</span>
      </div>
      <h4>{meta.name}</h4>
      <p className={styles.findingText}>{meta.authority}</p>

      {finding.elementsPresent && elementsTotal > 0 ? (
        <div
          className={styles.pips}
          aria-label={`${finding.elementsPresent.length} of ${elementsTotal} elements located`}
        >
          {Array.from({ length: elementsTotal }).map((_, index) => (
            <span
              key={index}
              className={`${styles.pip} ${
                index < finding.elementsPresent!.length ? styles.pipMet : ""
              }`}
              aria-hidden="true"
            />
          ))}
          <span className={`${styles.pipLabel} ${styles.mono}`}>
            {finding.elementsPresent.length} of {elementsTotal} elements
          </span>
        </div>
      ) : null}

      {finding.source ? (
        <a
          className={styles.citation}
          href={finding.source.url}
          target="_blank"
          rel="noreferrer"
        >
          <span className={styles.citationTitle}>{meta.name}</span>
          <span className={styles.citationSrc}>
            {fileName(finding.source.url)}
          </span>
          {finding.source.quotedSpan ? (
            <span className={`${styles.citationQuote} ${showFullPassage ? styles.citationQuoteFull : ""}`}>
              {finding.source.quotedSpan}
            </span>
          ) : null}
        </a>
      ) : null}

      {finding.source?.quotedSpan ? (
        <button
          className={styles.quoteToggle}
          type="button"
          aria-expanded={showFullPassage}
          onClick={() => setShowFullPassage((current) => !current)}
        >
          {showFullPassage ? "HIDE" : "SHOW FULL PASSAGE"}
        </button>
      ) : null}

      {finding.note && finding.status !== "found" ? (
        <p className={styles.findingNote}>{finding.note}</p>
      ) : null}

      {finding.status === "not_located" ? (
        <a className={styles.draftLink} href="#verification">
          Draft inquiry →
        </a>
      ) : null}
    </article>
  );
}
