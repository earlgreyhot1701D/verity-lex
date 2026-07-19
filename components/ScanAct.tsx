/** Renders the editorial masthead and local court observation form. */

"use client";

import type { FormEvent } from "react";
import styles from "@/styles/readiness-register.module.css";

interface ScanActProps {
  institution: string;
  targetDomain: string;
  onObserve: (institution: string, targetDomain: string) => void;
}

export function ScanAct({ institution, targetDomain, onObserve }: ScanActProps) {
  const observe = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onObserve(String(form.get("court") ?? ""), targetDomain);
    document.getElementById("observation")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className={styles.wrap}>
      <nav className={styles.nav} aria-label="Primary navigation">
        <div className={styles.brand}>
          <span className={styles.logoMark} aria-hidden="true" />
          <b>VERITY LEX</b>
          <span className={styles.mono}>V0.1 · MVP</span>
        </div>
        <div className={`${styles.navLinks} ${styles.mono}`} aria-label="Page sections">
          <a href="#scan">Scan</a>
          <span>Method</span>
          <span>Rubric</span>
          <span>Field Notes</span>
        </div>
      </nav>

      <section className={styles.hero} id="scan" aria-labelledby="scan-title">
        <div>
          <p className={`${styles.eyebrow} ${styles.mono}`}>AI READINESS, OBSERVED</p>
          <h1 id="scan-title">
            SEE A COURT
            <br />
            <span className={styles.serifItalic}>on the record.</span>
          </h1>
          <p className={styles.lede}>
            <span className={styles.dropCap}>P</span>ublic institutions are told to use AI
            with no way to know if they are ready. Verity Lex reads a court&apos;s
            public record and shows what the evidence supports, what cannot be seen from
            outside, and cites every claim to its source.
          </p>
          <dl className={styles.attributes}>
            <div>
              <dt className={styles.mono}>Approach</dt>
              <dd>Deterministic</dd>
            </div>
            <div>
              <dt className={styles.mono}>Source</dt>
              <dd>California law</dd>
            </div>
            <div>
              <dt className={styles.mono}>Stance</dt>
              <dd>Observational</dd>
            </div>
            <div>
              <dt className={styles.mono}>Claims</dt>
              <dd>Cited</dd>
            </div>
          </dl>
          <p className={`${styles.issue} ${styles.mono}`}>
            ISSUE 001 · JULY MMXXVI · ENGINE: THEMIS ATLAS
          </p>
        </div>

        <form className={styles.scanCard} onSubmit={observe}>
          <div className={`${styles.scanRow} ${styles.mono}`}>
            <span>§ 01 · BEGIN OBSERVATION</span>
            <span className={styles.statusChip}>
              <span className={styles.statusDot} aria-hidden="true" />
              SYSTEM READY
            </span>
          </div>
          <h2>NAME A COURT.</h2>
          <p className={styles.scanAccent}>See the record.</p>
          <p className={styles.scanDescription}>
            Public record scan. Deeper repository and staff readiness belong to a later
            tier.
          </p>
          <div className={styles.field}>
            <label className={styles.visuallyHidden} htmlFor="court-name">
              Court name
            </label>
            <input id="court-name" name="court" defaultValue={institution} required />
            <button type="submit">OBSERVE →</button>
          </div>
          <p className={`${styles.finePrint} ${styles.mono}`}>
            NO LOGIN · PUBLIC DATA ONLY · EVERY CLAIM CITED
          </p>
        </form>
      </section>
    </div>
  );
}
