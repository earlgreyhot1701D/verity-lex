/** Supplies a registry-scored July 18 sample using only the surviving cited documents. */
import registryData from './registry.v1.json' with { type: 'json' };
import { evaluate, type Registry } from '../lib/ruleEngine/evaluate.ts';
import type { ScanResult, Source } from '../lib/types.ts';

const fetchedAt = '2026-07-18T14:00:00.000Z';
const evidence: Record<string, Source> = {
  genai_policy: {
    url: 'https://www.santabarbara.courts.ca.gov/system/files/general/genai-policy-12152025.pdf',
    quotedSpan: 'Court users shall not enter confidential, personal identifying, or other nonpublic information into a public generative AI system.',
    fetchedAt,
  },
  strategic_plan: {
    url: 'https://www.santabarbara.courts.ca.gov/system/files/general/01-sb-sup-ct-strategic-plan-final-111224.pdf',
    quotedSpan: 'Strategic Plan 2025–2029',
    fetchedAt,
  },
};
const evaluated = evaluate('Santa Barbara Superior Court', [
  { artifactId: 'genai_policy', present: true, hasSource: true, elementsPresent: ['no_nonpublic_data', 'no_discrimination', 'verify_accuracy', 'remove_harmful', 'comply_laws_ethics'] },
  { artifactId: 'strategic_plan', present: true, hasSource: true },
], registryData as Registry);

export const cachedSantaBarbaraScan: ScanResult = {
  ...evaluated,
  state: 'draft',
  findings: evaluated.findings.map((finding) => ({
    ...finding,
    ...(evidence[finding.artifactId] ? { source: evidence[finding.artifactId] } : {}),
    ...(finding.status === 'not_located' ? { note: 'Not located in the retained sample evidence. This is not a finding of absence.' } : {}),
  })),
  coverageCaveat: 'Historical July 18 sample, rescored against registry v1.0. Unavailable citations were removed during QA; this is not a fresh scan.',
  generatedAt: fetchedAt,
  runLog: [
    { tool: 'self_check', outcome: 'Historical sample · two retained source documents · not a live observation', ok: true, ts: fetchedAt },
    { tool: 'evaluate', outcome: 'Current deterministic registry scored the retained evidence', ok: true, ts: fetchedAt },
  ],
};
