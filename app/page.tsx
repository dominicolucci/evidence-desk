"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ResearchRun, ResearchSummary } from "../lib/types";

type Tab = "brief" | "evidence" | "financials" | "report";
type LoadState = "loading" | "ready" | "missing" | "error";

const DEFAULT_TICKER = "AMD";

const tabLabels: Record<Tab, string> = {
  brief: "Research brief",
  evidence: "Evidence map",
  financials: "Financial lens",
  report: "Report draft",
};

interface MissingInfo {
  ticker: string;
  message: string;
  available: string[];
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("brief");
  const [ticker, setTicker] = useState(DEFAULT_TICKER);
  const [query, setQuery] = useState("");
  const [run, setRun] = useState<ResearchRun | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [missing, setMissing] = useState<MissingInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [available, setAvailable] = useState<ResearchSummary[]>([]);
  const [selectedClaim, setSelectedClaim] = useState("");
  const [copied, setCopied] = useState(false);

  const loadRun = useCallback(async (rawTicker: string) => {
    const symbol = rawTicker.trim().toUpperCase();
    if (!symbol) return;

    setLoadState("loading");
    setMissing(null);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/research/${encodeURIComponent(symbol)}`);

      if (response.status === 404) {
        const body = await response.json();
        setRun(null);
        setMissing({
          ticker: body.ticker ?? symbol,
          message: body.message ?? `No research run available for ${symbol}.`,
          available: body.available ?? [],
        });
        setLoadState("missing");
        return;
      }

      if (!response.ok) throw new Error(`Request failed with ${response.status}`);

      const data: ResearchRun = await response.json();
      setRun(data);
      setQuery(data.query);
      setSelectedClaim(data.claims[0]?.id ?? "");
      setActiveTab("brief");
      setLoadState("ready");
    } catch (error) {
      setRun(null);
      setErrorMessage(error instanceof Error ? error.message : "Unknown error");
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    loadRun(DEFAULT_TICKER);
  }, [loadRun]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/research")
      .then((response) => (response.ok ? response.json() : { runs: [] }))
      .then((body) => {
        if (!cancelled) setAvailable(body.runs ?? []);
      })
      .catch(() => {
        if (!cancelled) setAvailable([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const claim = useMemo(() => {
    if (!run) return null;
    return run.claims.find((item) => item.id === selectedClaim) ?? run.claims[0] ?? null;
  }, [run, selectedClaim]);

  const sourceById = useCallback(
    (id: string) => run?.sources.find((source) => source.id === id),
    [run],
  );

  async function copyBrief() {
    if (!run) return;
    await navigator.clipboard.writeText(run.briefText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  const isLoading = loadState === "loading";

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <span>Evidence Desk</span>
        </div>

        <div className="side-label">Workspace</div>
        <nav className="side-nav" aria-label="Research workspace">
          {(Object.keys(tabLabels) as Tab[]).map((tab, index) => (
            <button className={activeTab === tab ? "side-link active" : "side-link"} key={tab} onClick={() => setActiveTab(tab)}>
              <span className="nav-index">0{index + 1}</span>
              <span>{tabLabels[tab]}</span>
            </button>
          ))}
        </nav>

        <div className="side-label recent-label">Research coverage</div>
        {available.length === 0 && <button className="recent-item muted" disabled><span className="ticker-badge outline">—</span><span><b>No runs</b><small>Coverage list unavailable</small></span></button>}
        {available.map((item) => (
          <button
            key={item.ticker}
            className={run?.company.ticker === item.ticker ? "recent-item active-research" : "recent-item muted"}
            onClick={() => { setTicker(item.ticker); loadRun(item.ticker); }}
          >
            <span className={run?.company.ticker === item.ticker ? "ticker-badge" : "ticker-badge outline"}>{item.ticker}</span>
            <span><b>{item.title}</b><small>{item.subtitle}</small></span>
          </button>
        ))}

        {run && (
          <div className="sidebar-foot">
            <div className="quality-ring"><span>{run.qualityScore}</span></div>
            <div><b>Research-grade</b><small>{run.qualitySummary}</small></div>
          </div>
        )}
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <div className="eyebrow">{run ? run.eyebrow : "Public equity research"}</div>
            <h1>{run ? run.title : isLoading ? "Loading research…" : "No research loaded"}</h1>
          </div>
          <div className="header-actions">
            {run && <span className="cutoff">Data cut-off&nbsp; {run.dataCutoff}</span>}
            <button className="ghost-button" onClick={copyBrief} disabled={!run}>{copied ? "Copied" : "Copy brief"}</button>
          </div>
        </header>

        <section className="research-command" aria-label="Research request">
          <div className="command-icon" aria-hidden="true">⌁</div>
          <label className="sr-only" htmlFor="research-ticker">Ticker</label>
          <input
            id="research-ticker"
            className="ticker-input"
            value={ticker}
            placeholder="Ticker"
            onChange={(event) => setTicker(event.target.value.toUpperCase())}
            onKeyDown={(event) => { if (event.key === "Enter") loadRun(ticker); }}
          />
          <label className="sr-only" htmlFor="research-query">Research question</label>
          <input
            id="research-query"
            value={query}
            placeholder="Research question"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => { if (event.key === "Enter") loadRun(ticker); }}
          />
          <button className="run-button" onClick={() => loadRun(ticker)} disabled={isLoading}>
            {isLoading ? "Researching…" : "Run analysis"}
          </button>
        </section>

        {run && (
          <section className="process-strip" aria-label="Agent research progress">
            <div className="process-head">
              <div><span className="live-dot" />Agent research trail</div>
              <span>Completed in {run.duration}</span>
            </div>
            <div className="steps">
              {run.steps.map((step) => (
                <div key={step.label} className="step complete">
                  <span className="step-number">✓</span>
                  <span><b>{step.label}</b><small>{step.detail}</small></span>
                </div>
              ))}
            </div>
          </section>
        )}

        {loadState === "missing" && missing && (
          <section className="panel" aria-live="polite">
            <div className="kicker">No coverage</div>
            <h2>{missing.message}</h2>
            <p className="lead-copy">
              Research runs are served from stored results. This build ships a
              single worked example; live retrieval and analysis are not yet
              implemented, so tickers without a stored run return nothing rather
              than showing another company&apos;s analysis.
            </p>
            {missing.available.length > 0 && (
              <div className="claim-list">
                {missing.available.map((symbol) => (
                  <button key={symbol} className="claim-button" onClick={() => { setTicker(symbol); loadRun(symbol); }}>
                    <span className="claim-id">{symbol}</span>
                    <span><b>Open {symbol} research</b><small>Stored run</small></span>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {loadState === "error" && (
          <section className="panel" aria-live="polite">
            <div className="kicker">Request failed</div>
            <h2>Could not load research</h2>
            <p className="lead-copy">{errorMessage}</p>
            <button className="run-button" onClick={() => loadRun(ticker)}>Retry</button>
          </section>
        )}

        {run && (
          <>
            <div className="mobile-tabs" role="tablist" aria-label="Analysis views">
              {(Object.keys(tabLabels) as Tab[]).map((tab) => (
                <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>{tabLabels[tab]}</button>
              ))}
            </div>

            {activeTab === "brief" && (
              <section className="content-grid brief-view">
                <article className="panel thesis-panel">
                  <div className="panel-topline">
                    <span className="status-pill preliminary">{run.thesis.posture}</span>
                    <span className="confidence">Evidence confidence <b>{run.thesis.evidenceConfidence}%</b></span>
                  </div>
                  <div className="thesis-heading">
                    <div>
                      <div className="kicker">Net research read</div>
                      <h2>{run.thesis.headline}</h2>
                    </div>
                    <div className="score-block"><strong>{run.thesis.score}</strong><span>/ 10</span><small>{run.thesis.scoreLabel}</small></div>
                  </div>
                  <p className="lead-copy">{run.thesis.leadCopy}</p>
                  <div className="metric-row">
                    {run.thesis.metrics.map((metric) => (
                      <div key={metric.label}>
                        <span>{metric.label}</span>
                        <b>{metric.value}</b>
                        {metric.note && (
                          <small className={metric.noteTone === "positive" ? "positive" : metric.noteTone === "negative" ? "negative" : undefined}>
                            {metric.note}
                          </small>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="source-note">
                    Primary support:{" "}
                    {run.thesis.primarySupport.map((id, index) => {
                      const source = sourceById(id);
                      if (!source) return null;
                      return (
                        <span key={id}>
                          {index > 0 && " and "}
                          <a href={source.url} target="_blank" rel="noreferrer">{source.title} [{source.id}]</a>
                        </span>
                      );
                    })}
                  </div>
                </article>

                <article className="panel monitor-panel">
                  <div className="panel-title-row"><div><div className="kicker">Decision hinge</div><h3>What must be true</h3></div><span className="icon-chip">↗</span></div>
                  <ol className="hinge-list">
                    {run.hinges.map((hinge, index) => (
                      <li key={hinge.title}>
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        <div><b>{hinge.title}</b><small>{hinge.detail}</small></div>
                      </li>
                    ))}
                  </ol>
                </article>

                <article className="panel debate-panel">
                  <div className="panel-title-row"><div><div className="kicker">Central debate</div><h3>{run.debate.title}</h3></div><span className="evidence-count">{run.debate.evidenceCount} evidence items</span></div>
                  <div className="debate-grid">
                    <div className="debate-side for"><span>Evidence for</span><b>{run.debate.for.headline}</b><p>{run.debate.for.detail}</p></div>
                    <div className="debate-divider"><span>VS</span></div>
                    <div className="debate-side against"><span>Evidence against</span><b>{run.debate.against.headline}</b><p>{run.debate.against.detail}</p></div>
                  </div>
                  <button
                    className="text-button"
                    onClick={() => {
                      if (run.debate.linkClaimId) setSelectedClaim(run.debate.linkClaimId);
                      setActiveTab("evidence");
                    }}
                  >
                    Inspect the evidence trail <span>→</span>
                  </button>
                </article>

                <article className="panel watch-panel">
                  <div className="panel-title-row"><div><div className="kicker">Red-team output</div><h3>What could break the view</h3></div><span className="risk-flag">{run.risks.length} live risks</span></div>
                  <ul className="risk-list">
                    {run.risks.map((risk) => (
                      <li key={risk.title}>
                        <span className={`risk-dot ${risk.severity}`} />
                        <div><b>{risk.title}</b><small>{risk.detail}</small></div>
                        <em>{risk.severityLabel}</em>
                      </li>
                    ))}
                  </ul>
                </article>
              </section>
            )}

            {activeTab === "evidence" && claim && (
              <section className="evidence-layout">
                <article className="panel claim-index">
                  <div className="kicker">Claim register</div>
                  <h2>Every conclusion has a trail</h2>
                  <p>Inspect support, contradictions, source type and unresolved questions.</p>
                  <div className="claim-list">
                    {run.claims.map((item) => (
                      <button key={item.id} onClick={() => setSelectedClaim(item.id)} className={claim.id === item.id ? "claim-button active" : "claim-button"}>
                        <span className="claim-id">{item.id}</span>
                        <span><b>{item.title}</b><small>{item.support} support · {item.challenge} challenge</small></span>
                        <strong>{item.confidence}%</strong>
                      </button>
                    ))}
                  </div>
                </article>

                <article className="panel claim-detail">
                  <div className="claim-detail-head">
                    <div><span className="status-pill supported">{claim.label}</span><h2>{claim.title}</h2></div>
                    <div className="confidence-wheel" style={{ "--score": `${claim.confidence * 3.6}deg` } as React.CSSProperties}><span>{claim.confidence}<small>%</small></span></div>
                  </div>
                  <p className="claim-summary">{claim.summary}</p>
                  <div className="evidence-items">
                    {claim.evidence.map((item, index) => (
                      <div className="evidence-item" key={`${claim.id}-${index}`}>
                        <span className={`evidence-type ${item.tone}`}>{item.kind}</span>
                        <p>{item.text}</p>
                        <a href={sourceById(item.source)?.url ?? run.sources[0]?.url} target="_blank" rel="noreferrer">{item.source} ↗</a>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="panel source-ledger">
                  <div className="panel-title-row"><div><div className="kicker">Source ledger</div><h3>Primary evidence</h3></div><span className="quality-tag">No stale sources</span></div>
                  {run.sources.map((source) => (
                    <a className="source-row" key={source.id} href={source.url} target="_blank" rel="noreferrer">
                      <span className="source-id">{source.id}</span>
                      <span><b>{source.title}</b><small>{source.type} · {source.date}</small></span>
                      <span>Open ↗</span>
                    </a>
                  ))}
                </article>
              </section>
            )}

            {activeTab === "financials" && (
              <section className="content-grid financial-view">
                <article className="panel segment-panel">
                  <div className="panel-title-row"><div><div className="kicker">Segment analysis</div><h2>Revenue mix has structurally shifted</h2></div><span className="source-chip">Source [{run.sources[run.sources.length - 1]?.id}]</span></div>
                  <div className="bar-chart">
                    {run.segments.map((segment) => {
                      const peak = Math.max(...run.segments.map((item) => item.value)) || 1;
                      return (
                        <div className="bar-row" key={segment.name}>
                          <span className="bar-name">{segment.name}</span>
                          <div className="bar-track"><i style={{ width: `${(segment.value / peak) * 100}%`, background: segment.color }} /></div>
                          <b>${segment.value.toFixed(1)}B</b>
                          <em className={segment.growth >= 0 ? "positive" : "negative"}>{segment.growth >= 0 ? "+" : ""}{segment.growth}%</em>
                        </div>
                      );
                    })}
                  </div>
                  <div className="chart-axis">
                    <span>$0</span>
                    <span>Quarterly revenue</span>
                    <span>${Math.max(...run.segments.map((item) => item.value)).toFixed(1)}B</span>
                  </div>
                  <div className="analysis-note"><b>Analyst interpretation</b><p>Data Center is not merely the fastest-growing segment; it now accounts for the majority of revenue and substantially all reported segment-level growth.</p></div>
                </article>

                <article className="panel quality-panel">
                  <div className="kicker">Quality scorecard</div>
                  <h3>Improving, with one major gate</h3>
                  <div className="score-list">
                    {run.scorecard.map((row) => (
                      <div key={row.label}>
                        <span>{row.label}</span>
                        <i><b className={row.caution ? "caution" : undefined} style={{ width: `${row.score * 10}%` }} /></i>
                        <strong>{row.score}</strong>
                      </div>
                    ))}
                  </div>
                  <small className="method-note">Scores are analyst interpretations, not market data. Each score is backed by the claim register.</small>
                </article>

                <article className="panel cash-panel">
                  <div className="panel-title-row"><div><div className="kicker">Capital gate</div><h3>{run.capital.heading}</h3></div>{run.capital.flag && <span className="risk-flag">{run.capital.flag}</span>}</div>
                  <div className="capital-grid">
                    {run.capital.items.map((item) => (
                      <div key={item.label} className={item.wide ? "wide" : undefined}>
                        <span>{item.label}</span>
                        <b>{item.value}</b>
                        {item.note && <small>{item.note}</small>}
                      </div>
                    ))}
                  </div>
                  <p className="capital-question"><span>Open model question</span> {run.capital.openQuestion}</p>
                </article>
              </section>
            )}

            {activeTab === "report" && (
              <section className="report-layout">
                <article className="panel report-paper">
                  <div className="report-masthead"><span>Evidence Desk Research</span><span>{run.report.date}</span></div>
                  <div className="report-title">
                    <div><span>{run.report.exchange}</span><h2>{run.company.name}</h2><p>{run.report.subtitle}</p></div>
                    <div className="report-rating"><span>Research posture</span><b>{run.report.rating}</b><small>Evidence confidence {run.thesis.evidenceConfidence}%</small></div>
                  </div>
                  <div className="report-callout"><b>Net read</b><p>{run.report.netRead}</p></div>
                  <div className="report-columns">
                    <section>
                      <h3>Investment thesis</h3>
                      <ol>
                        {run.report.thesisPoints.map((point) => (
                          <li key={point.title}><b>{point.title}</b> {point.detail}</li>
                        ))}
                      </ol>
                    </section>
                    <section>
                      <h3>Key disconfirmers</h3>
                      <ul>
                        {run.report.disconfirmers.map((item) => <li key={item}>{item}</li>)}
                      </ul>
                    </section>
                  </div>
                  <h3 className="report-section-title">Evidence posture</h3>
                  <p className="report-body">{run.report.evidencePosture}</p>
                  <div className="report-footnotes">{run.report.footnotes}</div>
                </article>

                <aside className="panel report-outline">
                  <div className="kicker">Report builder</div>
                  <h3>Initiation outline</h3>
                  <ul>
                    {run.report.outline.map((item, index) => (
                      <li key={item.label} className={item.done ? "done" : undefined}>
                        <span>{item.done ? "✓" : index + 1}</span> {item.label}
                        {item.note && <small>{item.note}</small>}
                      </li>
                    ))}
                  </ul>
                  <button className="run-button full" onClick={copyBrief}>{copied ? "Brief copied" : "Copy report summary"}</button>
                  <p>{run.report.nextDataRequest}</p>
                </aside>
              </section>
            )}
          </>
        )}
      </section>
    </main>
  );
}
