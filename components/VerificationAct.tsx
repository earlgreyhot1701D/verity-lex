/** Verification station: the human gate. Absence is never asserted by the tool. */

"use client";

import registryData from "@/data/registry.v1.json";
import type { Finding } from "@/lib/types";
import styles from "@/styles/readiness-register.module.css";
import { Fragment, useState } from "react";

interface VerificationActProps {
  findings: Finding[];
}

interface RegistryArtifact {
  id: string;
  name: string;
  authority: { citation: string };
}

const artifacts = (registryData as { artifacts: RegistryArtifact[] }).artifacts;

const humanize = (id: string) =>
  id.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

const draftFor = (name: string, citation: string) => `To the Records Access Officer:

Pursuant to ${citation}, please identify any publicly available index, policy, or inventory concerning the court's ${name} in effect as of the date of this request.

Please include the adoption date and approving authority.`;

export function VerificationAct({ findings }: VerificationActProps) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const queued = findings.filter((finding) => finding.status === "not_located");

  return (
    <div className={styles.wrap}>
      <section
        className={styles.verification}
        id="verification"
        aria-labelledby="verify-title"
      >
        <p className={`${styles.sectionMark} ${styles.mono}`}>
          § 04 · BEFORE YOU CLAIM ANYTHING
        </p>
        <h2 id="verify-title">
          UNKNOWN IS A STATUS,{" "}
          <span className={styles.serifItalic}>not a verdict.</span>
        </h2>
        <p className={styles.verificationLead}>
          The tool drafts. A human sends. Only a court&apos;s confirmation flips
          it to Verified.
        </p>

        <div className={styles.vgrid}>
          {queued.length > 0 ? queued.map((finding, index) => {
            const artifact = artifacts.find((item) => item.id === finding.artifactId);
            const name = artifact?.name ?? humanize(finding.artifactId);
            const citation = artifact?.authority.citation ?? "the applicable public-records authority";
            const isOpen = Boolean(open[finding.artifactId]);
            return (
              <Fragment key={finding.artifactId}>
                <article className={styles.queueCard}>
                  <span className={styles.queueLabel}>
                    Queue {String(index + 1).padStart(2, "0")} · Public confirmation
                  </span>
                  <h4>{name}</h4>
                  <p className={styles.queueText}>
                    No responsive public index was located. The record may exist outside
                    the pages reviewed.
                  </p>
                  <button
                    className={styles.queueButton}
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpen((current) => ({
                      ...current,
                      [finding.artifactId]: !current[finding.artifactId],
                    }))}
                  >
                    {isOpen ? "HIDE DRAFT" : "REVEAL DRAFT"}
                    <span aria-hidden="true">{isOpen ? "−" : "+"}</span>
                  </button>
                </article>

                <article
                  className={`${styles.draftCard} ${isOpen ? styles.draftOpen : ""}`}
                  aria-hidden={!isOpen}
                >
                  <span className={styles.draftLabel}>
                    Draft public inquiry · human review required
                  </span>
                  <p className={styles.draftBody}>{draftFor(name, citation)}</p>
                </article>
              </Fragment>
            );
          }) : (
            <p className={`${styles.queueLabel} ${styles.mono}`}>
              NOTHING IN QUEUE · ALL ARTIFACTS LOCATED OR VERIFIED
            </p>
          )}
        </div>

        <div className={styles.legend}>
          <span>
            <span className={`${styles.legendDot} ${styles.legendFound}`} />
            Found · located and cited
          </span>
          <span>
            <span className={`${styles.legendDot} ${styles.legendNot}`} />
            Not located · unverified
          </span>
          <span>
            <span className={`${styles.legendDot} ${styles.legendVer}`} />
            Verified · court confirmed
          </span>
        </div>
      </section>
    </div>
  );
}
