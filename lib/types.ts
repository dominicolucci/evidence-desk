/**
 * Typed model for a single research run.
 *
 * Everything the UI renders comes from a ResearchRun. Nothing about a specific
 * company should appear in a component — if a value is company-specific, it
 * belongs in here and is supplied by the data layer.
 */

export type EvidenceTone = "fact" | "derived" | "claim" | "risk" | "open";

/** How a piece of evidence was obtained. Kept as free text so new provenance
 *  categories don't require a code change, while `tone` drives styling. */
export type EvidenceKind =
  | "Reported fact"
  | "Derived"
  | "Management claim"
  | "Challenge"
  | "Open question"
  | (string & {});

export type RiskSeverity = "high" | "med" | "low";

export interface Source {
  id: string;
  type: string;
  title: string;
  /** Human-readable publication date, e.g. "Aug 4, 2026". */
  date: string;
  url: string;
}

export interface Evidence {
  /** References Source.id. */
  source: string;
  kind: EvidenceKind;
  text: string;
  tone: EvidenceTone;
}

export interface Claim {
  id: string;
  title: string;
  /** 0-100. */
  confidence: number;
  label: string;
  support: number;
  challenge: number;
  summary: string;
  evidence: Evidence[];
}

export interface Segment {
  name: string;
  /** Revenue in billions. */
  value: number;
  /** Year-over-year percent change; negative means decline. */
  growth: number;
  /** CSS colour token, e.g. "var(--accent)". */
  color: string;
}

export interface ResearchStep {
  label: string;
  detail: string;
}

export interface Metric {
  label: string;
  value: string;
  note?: string;
  noteTone?: "positive" | "negative" | "neutral";
}

export interface Hinge {
  title: string;
  detail: string;
}

export interface DebateSide {
  headline: string;
  detail: string;
}

export interface Debate {
  title: string;
  evidenceCount: number;
  for: DebateSide;
  against: DebateSide;
  /** Claim to open when the reader follows the evidence trail. */
  linkClaimId?: string;
}

export interface Risk {
  title: string;
  detail: string;
  severity: RiskSeverity;
  severityLabel: string;
}

export interface ScoreRow {
  label: string;
  /** 0-10. */
  score: number;
  caution?: boolean;
}

export interface CapitalItem {
  label: string;
  value: string;
  note?: string;
  wide?: boolean;
}

export interface Capital {
  heading: string;
  flag?: string;
  items: CapitalItem[];
  openQuestion: string;
}

export interface Thesis {
  posture: string;
  /** 0-100. */
  evidenceConfidence: number;
  headline: string;
  /** e.g. 7.6 out of 10. */
  score: number;
  scoreLabel: string;
  leadCopy: string;
  metrics: Metric[];
  /** Source ids cited under the metric row. */
  primarySupport: string[];
}

export interface ReportOutlineItem {
  label: string;
  done: boolean;
  note?: string;
}

export interface Report {
  date: string;
  exchange: string;
  subtitle: string;
  rating: string;
  netRead: string;
  thesisPoints: { title: string; detail: string }[];
  disconfirmers: string[];
  evidencePosture: string;
  footnotes: string;
  outline: ReportOutlineItem[];
  nextDataRequest: string;
}

export interface Company {
  ticker: string;
  name: string;
  exchange: string;
}

export interface ResearchRun {
  company: Company;
  /** The research question this run answers. */
  query: string;
  title: string;
  eyebrow: string;
  /** Data cut-off shown in the header — the point-in-time boundary. */
  dataCutoff: string;
  /** Wall-clock duration of the completed run, e.g. "4m 18s". */
  duration: string;
  qualityScore: number;
  qualitySummary: string;
  steps: ResearchStep[];
  thesis: Thesis;
  hinges: Hinge[];
  debate: Debate;
  risks: Risk[];
  claims: Claim[];
  segments: Segment[];
  sources: Source[];
  scorecard: ScoreRow[];
  capital: Capital;
  report: Report;
  /** Plain-text summary used by the "Copy brief" action. */
  briefText: string;
}

/** Summary entry for the sidebar's recent-research list. */
export interface ResearchSummary {
  ticker: string;
  title: string;
  subtitle: string;
}
