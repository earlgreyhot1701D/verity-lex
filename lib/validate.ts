/** Validates and normalizes scan inputs identically in browser and server code. */

const DOMAIN_PATTERN = /^(?=.{1,253}$)(?:[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?\.)+[a-z](?:[a-z\d-]{0,61}[a-z\d])?$/i;

export interface ScanInput {
  institution: string;
  targetDomain: string;
}

export type ValidationResult =
  | { ok: true; value: ScanInput }
  | { ok: false; error: string };

export function validateScanInput(institution: unknown, targetDomain: unknown): ValidationResult {
  if (typeof institution !== "string" || institution.trim().length === 0) {
    return { ok: false, error: "Institution must be a non-empty string." };
  }
  if (typeof targetDomain !== "string" || !DOMAIN_PATTERN.test(targetDomain.trim())) {
    return { ok: false, error: "Target domain must be a valid hostname without a protocol or path." };
  }
  return {
    ok: true,
    value: {
      institution: institution.trim(),
      targetDomain: targetDomain.trim().toLowerCase(),
    },
  };
}
