/** Publishes the complete deterministic scoring registry and its legal authorities. */

import registry from "@/data/registry.v1.json";
import styles from "@/styles/readiness-register.module.css";

export default function MethodsPage() {
  return (
    <main className={styles.wrap}>
      <section className={styles.surface} aria-labelledby="methods-title">
        <p className={`${styles.sectionMark} ${styles.mono}`}>
          METHODS · REGISTRY VERSION {registry.version}
        </p>
        <h2 id="methods-title">
          EVERY WEIGHT, <span className={styles.serifItalic}>published.</span>
        </h2>
        <div className={styles.scoreMeter}>
          <p className={styles.scoreCaption}>
            The score is computed by a deterministic rule engine from these published
            weights; the model never assigns the score. Registry v1.0 is built for
            California superior courts; each artifact cites the California authority
            that grounds it. Artifact selection is grounded in published California
            authorities. The weights are Verity Lex methodology v1.0 and reflect our
            judgment; they invite expert validation, not just recomputation.
          </p>
        </div>

        <div className={styles.findings}>
          {registry.artifacts.map((artifact) => (
            <article className={styles.findingCard} key={artifact.id}>
              <div className={`${styles.findingTop} ${styles.mono}`}>
                <span>DIMENSION {artifact.dimension}</span>
                <span>
                  {artifact.tier === "required" ? "Required" : "Recommended"} · {artifact.weight} points
                </span>
              </div>
              <h4>{artifact.name}</h4>
              <p className={styles.findingText}>
                <a href={artifact.authority.url}>{artifact.authority.name}</a>
              </p>
              <p className={styles.findingNote}>{artifact.authority.citation}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
