/** Frames the agent activity log as the primary observation narrative. */

import type { RunStep } from "@/lib/types";
import { AgentLog } from "@/components/AgentLog";
import styles from "@/styles/readiness-register.module.css";

interface ObservationActProps {
  runLog: RunStep[];
}

export function ObservationAct({ runLog }: ObservationActProps) {
  return (
    <div className={styles.wrap}>
      <section className={styles.observation} id="observation" aria-labelledby="log-title">
        <p className={`${styles.sectionMark} ${styles.mono}`}>§ 02 · WATCH THE RECORD</p>
        <h2 id="log-title">
          THE AGENT DECIDES <span className={styles.serifItalic}>where to look.</span>
        </h2>
        <p className={styles.sectionLead}>
          Not a checklist. The model plans, searches, reads, and chooses its next move
          based on what it finds, then stops when it has evidence or has exhausted the
          sources. Deterministic tools do the scoring. The model directs the hunt.
        </p>
        <AgentLog steps={runLog} />
      </section>
    </div>
  );
}
