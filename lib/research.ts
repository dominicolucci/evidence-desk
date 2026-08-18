import type { ResearchRun, ResearchSummary } from "./types";
import amd from "../data/amd.json";

/**
 * Data access for research runs.
 *
 * Today this reads bundled JSON fixtures. The seam is deliberate: when a real
 * pipeline exists (filing retrieval, calculation, claim formation), it replaces
 * the body of these two functions and nothing in the UI changes.
 *
 * Only AMD has a fixture. Every other ticker resolves to null, which the UI
 * renders as "no research available" — the app reports what it actually has
 * rather than showing one company's analysis under another company's name.
 */

const RUNS: Record<string, ResearchRun> = {
  AMD: amd as ResearchRun,
};

export function normalizeTicker(input: string): string {
  return input.trim().toUpperCase();
}

export function getResearchRun(ticker: string): ResearchRun | null {
  return RUNS[normalizeTicker(ticker)] ?? null;
}

export function listResearch(): ResearchSummary[] {
  return Object.values(RUNS).map((run) => ({
    ticker: run.company.ticker,
    title: `${run.company.ticker} initiation`,
    subtitle: run.thesis.posture,
  }));
}

export function availableTickers(): string[] {
  return Object.keys(RUNS);
}
