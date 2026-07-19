/** The deterministic public-evidence surface: score meter + cited findings. */

import type { Finding, ScanResult } from "@/lib/types";
import styles from "@/styles/readiness-register.module.css";
import { AuditDownload } from "@/components/AuditDownload";
import { FindingCard } from "@/components/FindingCard";

interface SurfaceActProps {
  scan: ScanResult | null;
  findings: Finding[];
  score: ScanResult["score"] | null;
}

const DIMENSIONS = {
  A: { label: "A · AI GOVERNANCE", max: 43, fill: "var(--teal)" },
  B: { label: "B · DATA FOUNDATIONS", max: 27, fill: "var(--orange)" },
  C: { label: "C · CAPACITY", max: 30, fill: "var(--sage)" },
} as const;

export function SurfaceAct({ scan, findings, score }: SurfaceActProps) {
  const shown = findings.filter(
    (finding) => finding.status === "found" || finding.status === "verified",
  );
  const unseen = findings.filter((finding) => finding.status === "not_located");
  const keys = ["A", "B", "C"] as const;

  return (
    <div className={styles.wrap}>
      <section
        className={styles.surface}
        id="surface"
        aria-labelledby="surface-title"
      >
        <p className={`${styles.sectionMark} ${styles.mono}`}>
          § 03 · WHAT THE RECORD SHOWS
        </p>
        <h2 id="surface-title">
          THE SURFACE,{" "}
          <span className={styles.serifItalic}>with its own math.</span>
        </h2>

        {scan && score ? (
          <>
            <div className={styles.scoreMeter}>
              <div className={styles.scoreHead}>
                <span className={styles.scoreFigure}>
                  {score.points}
                  <small>/ {score.outOf}</small>
                </span>
                <span className={`${styles.scoreLabel} ${styles.mono}`}>
                  Draft public-evidence surface
                </span>
              </div>
              <div className={styles.dims}>
                {keys.map((key) => {
                  const dimension = DIMENSIONS[key];
                  const value = score.byDimension[key];
                  const width = Math.round((value / dimension.max) * 100);
                  return (
                    <div className={`${styles.dimRow} ${styles.mono}`} key={key}>
                      <span>{dimension.label}</span>
                      <span className={styles.dimTrack}>
                        <span
                          className={styles.dimFill}
                          style={{ width: `${width}%`, background: dimension.fill }}
                        />
                      </span>
                      <span className={styles.dimValue}>
                        {value} / {dimension.max}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className={styles.scoreCaption}>
                Computed by the rule engine, not the model. Weights are published.
                Recompute it yourself.
              </p>
              <a className={`${styles.scoreCaption} ${styles.mono}`} href="/methods">
                Methods · every weight published
              </a>
              <AuditDownload scan={scan} />
            </div>

            <div className={styles.findings}>
              <div>
                <h3 className={styles.colTitle}>What the record shows</h3>
                {shown.map((finding) => (
                  <FindingCard finding={finding} key={finding.artifactId} />
                ))}
              </div>
              <div>
                <h3 className={styles.colTitle}>What we can&apos;t see</h3>
                {unseen.map((finding) => (
                  <FindingCard finding={finding} key={finding.artifactId} />
                ))}
              </div>
            </div>
          </>
        ) : (
          <p className={`${styles.sectionMark} ${styles.mono}`}>
            NO SURFACE YET · RUN A SCAN OR LOAD THE SAMPLE
          </p>
        )}
      </section>
    </div>
  );
}
