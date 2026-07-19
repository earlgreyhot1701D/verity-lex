/** Agent-loop self-checks for enforcing public official-domain guardrails and bounded execution. */

export interface LoopLimits {
  maxIterations: number;
  maxFetches: number;
}

export function isOfficialSource(url: string, targetDomain: string): boolean {
  const parsed = new URL(url);
  return parsed.protocol === "https:" && (parsed.hostname === targetDomain || parsed.hostname.endsWith(`.${targetDomain}`));
}

export function canContinue(iterations: number, fetches: number, limits: LoopLimits): boolean {
  return iterations < limits.maxIterations && fetches < limits.maxFetches;
}
