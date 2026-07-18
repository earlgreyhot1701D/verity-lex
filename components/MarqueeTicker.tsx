/** Displays the repeating evidence principles between the opening acts. */

import styles from "@/styles/readiness-register.module.css";

const phrase = (
  <>
    <b>•</b> EVIDENCE, not verdict <b>•</b> WHAT WE SEE, WHAT WE CAN&apos;T <b>•</b> THE
    RECORD SPEAKS <b>•</b> EVERY CLAIM CITED
  </>
);

export function MarqueeTicker() {
  return (
    <div className={styles.marquee} aria-label="Evidence principles">
      <div className={styles.marqueeTrack}>
        <span>{phrase}</span>
        <span aria-hidden="true">{phrase}</span>
      </div>
    </div>
  );
}
