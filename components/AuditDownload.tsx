/** Downloads a self-contained audit bundle for the currently rendered scan. */

"use client";

import registryData from "@/data/registry.v1.json";
import { buildAuditBundle, toDownload } from "@/lib/audit/export";
import type { ScanResult } from "@/lib/types";
import styles from "@/styles/readiness-register.module.css";

interface AuditDownloadProps {
  scan: ScanResult;
}

export function AuditDownload({ scan }: AuditDownloadProps) {
  const download = () => {
    const bundle = buildAuditBundle(scan, registryData.version);
    const file = toDownload(bundle);
    const url = URL.createObjectURL(new Blob([file.blobText], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = file.filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button className={styles.queueButton} type="button" onClick={download}>
      Download audit bundle · recompute this yourself
    </button>
  );
}
