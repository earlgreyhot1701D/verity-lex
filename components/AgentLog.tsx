/** Streams typed observation steps with replay and reduced motion support. */

"use client";

import { useEffect, useState } from "react";
import type { RunStep } from "@/lib/types";
import styles from "@/styles/readiness-register.module.css";

interface AgentLogProps {
  steps: RunStep[];
}

const glyphFor = (step: RunStep, index: number, length: number) => {
  if (!step.ok) return "⚠";
  if (index === length - 1) return "■";
  if (step.tool === "discover" || step.tool === "plan") return "▸";
  if (step.tool === "self_check") return "⤿";
  return "✓";
};

export function AgentLog({ steps }: AgentLogProps) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [replayKey, setReplayKey] = useState(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      const reducedTimer = window.setTimeout(
        () => setVisibleCount(steps.length),
        0,
      );
      return () => window.clearTimeout(reducedTimer);
    }

    let next = 0;
    const timer = window.setInterval(() => {
      next += 1;
      setVisibleCount(next);
      if (next >= steps.length) window.clearInterval(timer);
    }, 240);

    return () => window.clearInterval(timer);
  }, [replayKey, steps.length]);

  return (
    <div>
      <div className={styles.log} role="log" aria-live="polite" aria-label="Agent activity">
        {steps.slice(0, visibleCount).map((step, index) => (
          <div
            className={`${styles.logLine} ${step.ok ? styles.logOk : styles.logWarning}`}
            key={`${step.ts}-${step.tool}`}
          >
            <span className={styles.logGlyph} aria-hidden="true">
              {glyphFor(step, index, steps.length)}
            </span>
            <span>{step.outcome}</span>
          </div>
        ))}
        <span className={styles.visuallyHidden}>
          {visibleCount} of {steps.length} observation steps shown
        </span>
      </div>
      <button
        className={styles.replay}
        type="button"
        onClick={() => setReplayKey((current) => current + 1)}
      >
        ▸ Replay observation
      </button>
    </div>
  );
}
