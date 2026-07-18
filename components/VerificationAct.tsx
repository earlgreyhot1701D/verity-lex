/** Verification station: the human gate. Absence is never asserted by the tool. */

"use client";

import { useState } from "react";
import type { Finding } from "@/lib/types";
import styles from "@/styles/readiness-register.module.css";

interface VerificationActProps {
  findings: Finding[];
}

const DRAFT = `To the Records Access Officer:

Pursuant to California Rule of Court 10.500, please identify any publicly available index, policy, or inventory concerning the court's use of generative artificial intelligence in effect as of the date of this request.

Please include the adoption date and approving authority.`;

export function VerificationAct({ findings }: VerificationActProps) {
  const [open, setOpen] = useState(false);
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
          <article className={styles.queueCard}>
            <span className={styles.queueLabel}>
              Queue 01 · Public confirmation
            </span>
            <h4>Rule 10.500 Access Process</h4>
            <p className={styles.queueText}>
              No responsive public index was located
              {queued.length > 1
                ? ` (1 of ${queued.length} items in the queue).`
                : "."}{" "}
              The record may exist outside the pages reviewed.
            </p>
            <button
              className={styles.queueButton}
              type="button"
              aria-expanded={open}
              onClick={() => setOpen((value) => !value)}
            >
              {open ? "HIDE DRAFT" : "REVEAL DRAFT"}
              <span aria-hidden="true">{open ? "−" : "+"}</span>
            </button>
          </article>

          <article
            className={`${styles.draftCard} ${open ? styles.draftOpen : ""}`}
            aria-hidden={!open}
          >
            <span className={styles.draftLabel}>
              Draft public inquiry · human review required
            </span>
            <p className={styles.draftBody}>{DRAFT}</p>
          </article>
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
