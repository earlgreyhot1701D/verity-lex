/** One finding as a card: Found / Not-located / Verified, with citation and pips. */

import type { Finding } from "@/lib/types";
import styles from "@/styles/readiness-register.module.css";

const LABELS: Record<
  string,
  { name: string; authority: string; category: string }
> = {
  genai_policy: {
    name: "Generative AI Use Policy",
    authority: "Cal. Rule of Court 10.430 · Required",
    category: "Court policy",
  },
  strategic_plan: {
    name: "Strategic Plan 2025–2029",
    authority: "Judicial Council planning · Recommended",
    category: "Published plan",
  },
  published_budget: {
    name: "FY25–26 Adopted Budget",
    authority: "Public fiscal transparency · Recommended",
    category: "Adopted budget",
  },
  records_retention: {
    name: "Records Retention Schedule",
    authority: "Gov. Code 68150 · Required",
    category: "Records management",
  },
  public_access_records: {
    name: "Rule 10.500 Access Process",
    authority: "Cal. Rule of Court 10.500 · Required",
    category: "Public records index",
  },
  language_access: {
    name: "Language Access Services",
    authority: "CA Strategic Plan for Language Access · Recommended",
    category: "Public service",
  },
};

const fileName = (url: string) => url.split("/").pop() || url;

export function FindingCard({ finding }: { finding: Finding }) {
  const meta = LABELS[finding.artifactId] ?? {
    name: finding.artifactId,
    authority: "",
    category: "",
  };
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

      {finding.elementsPresent ? (
        <div
          className={styles.pips}
          aria-label={`${finding.elementsPresent.length} of 6 elements located`}
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <span
              key={index}
              className={`${styles.pip} ${
                index < finding.elementsPresent!.length ? styles.pipMet : ""
              }`}
              aria-hidden="true"
            />
          ))}
          <span className={`${styles.pipLabel} ${styles.mono}`}>
            {finding.elementsPresent.length} of 6 elements
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
            <span className={styles.citationQuote}>
              {finding.source.quotedSpan}
            </span>
          ) : null}
        </a>
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
