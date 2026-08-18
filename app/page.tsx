"use client";

import { useEffect, useMemo, useState } from "react";

type Tab = "brief" | "evidence" | "financials" | "report";
type RunState = "idle" | "running" | "done";

const researchSteps = [
  { label: "Scope the question", detail: "Business quality + competitive position" },
  { label: "Gather primary evidence", detail: "10-Q, 10-K, earnings release" },
  { label: "Normalize & calculate", detail: "Mix, growth, margin, commitments" },
  { label: "Challenge the thesis", detail: "Dilution, concentration, execution risk" },
  { label: "Draft the report", detail: "Claims, confidence, open questions" },
];

const claims = [
  {
    id: "C1",
    title: "Data Center is now AMD's primary growth engine",
    confidence: 92,
    label: "Strongly supported",
    support: 3,
    challenge: 1,
    summary:
      "Q2 Data Center revenue reached $6.7B, or 58% of company revenue, and grew 107% year over year. The segment also produced $2.1B of operating income.",
    evidence: [
      { source: "S1", kind: "Reported fact", text: "$6.7B Q2 Data Center revenue; +107% YoY.", tone: "fact" },
      { source: "S1", kind: "Derived", text: "58.2% of consolidated Q2 revenue.", tone: "derived" },
      { source: "S2", kind: "Reported fact", text: "$16.6B FY2025 Data Center revenue; +32% YoY.", tone: "fact" },
      { source: "S1", kind: "Challenge", text: "Prior-year profit comparison includes MI308 export-control charges.", tone: "risk" },
    ],
  },
  {
    id: "C2",
    title: "AMD has broadened from chips toward rack-scale AI systems",
    confidence: 76,
    label: "Supported, execution pending",
    support: 3,
    challenge: 2,
    summary:
      "EPYC, Instinct, networking and the Helios rack platform create a broader systems proposition. The strategic direction is clear; proof of scaled deployment and durable economics is still developing.",
    evidence: [
      { source: "S2", kind: "Reported fact", text: "Helios combines CPUs, GPUs and networking in a rack-scale platform.", tone: "fact" },
      { source: "S2", kind: "Reported fact", text: "ZT design capabilities were retained after the manufacturing sale.", tone: "fact" },
      { source: "S1", kind: "Management claim", text: "Helios is beginning to ramp in the second half of 2026.", tone: "claim" },
      { source: "S3", kind: "Challenge", text: "Deployment visibility does not yet prove normalized returns.", tone: "risk" },
    ],
  },
  {
    id: "C3",
    title: "Growth quality must be judged against commitments and dilution",
    confidence: 86,
    label: "Material underwriting gate",
    support: 2,
    challenge: 0,
    summary:
      "The balance sheet is liquid, but future purchase, lease and investment commitments are large. Customer warrants introduce potential dilution tied to deployment milestones.",
    evidence: [
      { source: "S3", kind: "Reported fact", text: "$30.3B of unconditional commitments at quarter end.", tone: "fact" },
      { source: "S3", kind: "Reported fact", text: "Customer warrants cover up to 320M shares in aggregate.", tone: "fact" },
      { source: "S3", kind: "Reported fact", text: "$13.1B cash and short-term investments; $3.3B debt.", tone: "fact" },
      { source: "S3", kind: "Open question", text: "What are after-financing cash returns by deployment cohort?", tone: "open" },
    ],
  },
];

const segmentData = [
  { name: "Data Center", value: 6.718, growth: 107, color: "var(--accent)" },
  { name: "Client", value: 3.062, growth: 23, color: "var(--teal)" },
  { name: "Embedded", value: 0.977, growth: 19, color: "var(--sand)" },
  { name: "Gaming", value: 0.779, growth: -31, color: "var(--coral)" },
];

const sources = [
  {
    id: "S1",
    type: "Primary filing",
    title: "AMD Q2 2026 earnings release",
    date: "Aug 4, 2026",
    url: "https://ir.amd.com/news-events/press-releases/detail/1295/amd-reports-second-quarter-2026-financial-results",
  },
  {
    id: "S2",
    type: "Primary filing",
    title: "AMD FY2025 Form 10-K",
    date: "Feb 3, 2026",
    url: "https://www.sec.gov/Archives/edgar/data/2488/000000248826000018/amd-20251227.htm",
  },
  {
    id: "S3",
    type: "Primary filing",
    title: "AMD Q2 2026 Form 10-Q",
    date: "Aug 5, 2026",
    url: "https://ir.amd.com/financial-information/sec-filings/content/0000002488-26-000123/amd-20260627.htm",
  },
];

const tabLabels: Record<Tab, string> = {
  brief: "Research brief",
  evidence: "Evidence map",
  financials: "Financial lens",
  report: "Report draft",
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("brief");
  const [query, setQuery] = useState("Analyze AMD's business quality and competitive position");
  const [runState, setRunState] = useState<RunState>("done");
  const [activeStep, setActiveStep] = useState(4);
  const [selectedClaim, setSelectedClaim] = useState("C1");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (runState !== "running") return;
    const timer = window.setInterval(() => {
      setActiveStep((step) => {
        if (step >= researchSteps.length - 1) {
          window.clearInterval(timer);
          setRunState("done");
          return step;
        }
        return step + 1;
      });
    }, 650);
    return () => window.clearInterval(timer);
  }, [runState]);

  const claim = useMemo(
    () => claims.find((item) => item.id === selectedClaim) ?? claims[0],
    [selectedClaim],
  );

  function runAnalysis() {
    setActiveStep(0);
    setRunState("running");
    setActiveTab("brief");
  }

  async function copyBrief() {
    const text = `AMD research posture — preliminary initiation\n\nNet read: AMD's business quality is improving as Data Center becomes the primary revenue and profit engine. The central underwriting question is whether rack-scale AI growth produces durable after-financing returns after commitments and potential dilution.\n\nEvidence confidence: Research-grade. Data cut-off: August 13, 2026.`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

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

        <div className="side-label recent-label">Recent research</div>
        <button className="recent-item active-research" onClick={() => setActiveTab("brief")}>
          <span className="ticker-badge">AMD</span>
          <span><b>AMD initiation</b><small>Updated today</small></span>
        </button>
        <button className="recent-item muted" onClick={() => setQuery("Map the data-center cooling market") }>
          <span className="ticker-badge outline">DC</span>
          <span><b>Cooling market</b><small>Research template</small></span>
        </button>

        <div className="sidebar-foot">
          <div className="quality-ring"><span>84</span></div>
          <div><b>Research-grade</b><small>12 claims · 3 primary sources</small></div>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <div className="eyebrow">Public equity · Long-only initiation</div>
            <h1>AMD business quality</h1>
          </div>
          <div className="header-actions">
            <span className="cutoff">Data cut-off&nbsp; 13 Aug 2026</span>
            <button className="ghost-button" onClick={copyBrief}>{copied ? "Copied" : "Copy brief"}</button>
          </div>
        </header>

        <section className="research-command" aria-label="Research request">
          <div className="command-icon" aria-hidden="true">⌁</div>
          <label className="sr-only" htmlFor="research-query">Research question</label>
          <input id="research-query" value={query} onChange={(event) => setQuery(event.target.value)} />
          <button className="run-button" onClick={runAnalysis} disabled={runState === "running"}>
            {runState === "running" ? "Researching…" : "Run analysis"}
          </button>
        </section>

        <section className="process-strip" aria-label="Agent research progress">
          <div className="process-head">
            <div><span className={runState === "running" ? "live-dot pulse" : "live-dot"} />Agent research trail</div>
            <span>{runState === "running" ? `Step ${activeStep + 1} of 5` : "Completed in 4m 18s"}</span>
          </div>
          <div className="steps">
            {researchSteps.map((step, index) => (
              <button key={step.label} className={index <= activeStep ? "step complete" : "step"} onClick={() => setActiveStep(index)}>
                <span className="step-number">{index < activeStep || runState === "done" ? "✓" : index + 1}</span>
                <span><b>{step.label}</b><small>{step.detail}</small></span>
              </button>
            ))}
          </div>
        </section>

        <div className="mobile-tabs" role="tablist" aria-label="Analysis views">
          {(Object.keys(tabLabels) as Tab[]).map((tab) => (
            <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>{tabLabels[tab]}</button>
          ))}
        </div>

        {activeTab === "brief" && (
          <section className="content-grid brief-view">
            <article className="panel thesis-panel">
              <div className="panel-topline">
                <span className="status-pill preliminary">Preliminary initiation</span>
                <span className="confidence">Evidence confidence <b>84%</b></span>
              </div>
              <div className="thesis-heading">
                <div>
                  <div className="kicker">Net research read</div>
                  <h2>Business quality is improving. The return profile still needs proof.</h2>
                </div>
                <div className="score-block"><strong>7.6</strong><span>/ 10</span><small>Business quality</small></div>
              </div>
              <p className="lead-copy">
                AMD has crossed an important mix threshold: Data Center is now the majority of revenue and the clearest source of operating leverage. The next question is harder—whether rack-scale AI deployments convert that growth into durable returns after commitments, customer incentives and execution costs.
              </p>
              <div className="metric-row">
                <div><span>Q2 revenue</span><b>$11.5B</b><small className="positive">+50% YoY</small></div>
                <div><span>Data Center mix</span><b>58%</b><small className="positive">+16 pts YoY</small></div>
                <div><span>GAAP op. margin</span><b>17%</b><small className="positive">+19 pts YoY</small></div>
                <div><span>Net cash</span><b>$9.8B</b><small>Derived from S3</small></div>
              </div>
              <div className="source-note">Primary support: <a href={sources[0].url} target="_blank" rel="noreferrer">Q2 earnings release [S1]</a> and <a href={sources[2].url} target="_blank" rel="noreferrer">Q2 Form 10-Q [S3]</a></div>
            </article>

            <article className="panel monitor-panel">
              <div className="panel-title-row"><div><div className="kicker">Decision hinge</div><h3>What must be true</h3></div><span className="icon-chip">↗</span></div>
              <ol className="hinge-list">
                <li><span>01</span><div><b>AI systems scale beyond isolated wins</b><small>Helios and MI450 deployments broaden across hyperscalers.</small></div></li>
                <li><span>02</span><div><b>Growth converts into cash returns</b><small>Margins and cash generation outrun capacity commitments.</small></div></li>
                <li><span>03</span><div><b>Software lowers switching friction</b><small>ROCm adoption reduces the ecosystem gap with CUDA.</small></div></li>
              </ol>
            </article>

            <article className="panel debate-panel">
              <div className="panel-title-row"><div><div className="kicker">Central debate</div><h3>Growth engine vs. financed growth</h3></div><span className="evidence-count">6 evidence items</span></div>
              <div className="debate-grid">
                <div className="debate-side for"><span>Evidence for</span><b>Data Center revenue +107%</b><p>Mix, growth and segment profit all moved sharply higher in Q2.</p></div>
                <div className="debate-divider"><span>VS</span></div>
                <div className="debate-side against"><span>Evidence against</span><b>$30.3B commitments</b><p>Future obligations and warrant dilution complicate simple revenue-growth framing.</p></div>
              </div>
              <button className="text-button" onClick={() => { setSelectedClaim("C3"); setActiveTab("evidence"); }}>Inspect the evidence trail <span>→</span></button>
            </article>

            <article className="panel watch-panel">
              <div className="panel-title-row"><div><div className="kicker">Red-team output</div><h3>What could break the view</h3></div><span className="risk-flag">3 live risks</span></div>
              <ul className="risk-list">
                <li><span className="risk-dot high" /><div><b>Deployment economics</b><small>Large commitments may compress after-financing returns.</small></div><em>High</em></li>
                <li><span className="risk-dot med" /><div><b>Customer concentration</b><small>Large deployments could increase negotiating power.</small></div><em>Medium</em></li>
                <li><span className="risk-dot med" /><div><b>Ecosystem execution</b><small>Hardware gains may not translate without software adoption.</small></div><em>Medium</em></li>
              </ul>
            </article>
          </section>
        )}

        {activeTab === "evidence" && (
          <section className="evidence-layout">
            <article className="panel claim-index">
              <div className="kicker">Claim register</div>
              <h2>Every conclusion has a trail</h2>
              <p>Inspect support, contradictions, source type and unresolved questions.</p>
              <div className="claim-list">
                {claims.map((item) => (
                  <button key={item.id} onClick={() => setSelectedClaim(item.id)} className={selectedClaim === item.id ? "claim-button active" : "claim-button"}>
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
                    <a href={sources.find((source) => source.id === item.source)?.url ?? sources[0].url} target="_blank" rel="noreferrer">{item.source} ↗</a>
                  </div>
                ))}
              </div>
            </article>

            <article className="panel source-ledger">
              <div className="panel-title-row"><div><div className="kicker">Source ledger</div><h3>Primary evidence</h3></div><span className="quality-tag">No stale sources</span></div>
              {sources.map((source) => (
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
              <div className="panel-title-row"><div><div className="kicker">Segment analysis · Q2 2026</div><h2>Revenue mix has structurally shifted</h2></div><span className="source-chip">Source [S3]</span></div>
              <div className="bar-chart">
                {segmentData.map((segment) => (
                  <div className="bar-row" key={segment.name}>
                    <span className="bar-name">{segment.name}</span>
                    <div className="bar-track"><i style={{ width: `${(segment.value / 6.718) * 100}%`, background: segment.color }} /></div>
                    <b>${segment.value.toFixed(1)}B</b>
                    <em className={segment.growth >= 0 ? "positive" : "negative"}>{segment.growth >= 0 ? "+" : ""}{segment.growth}%</em>
                  </div>
                ))}
              </div>
              <div className="chart-axis"><span>$0</span><span>Quarterly revenue</span><span>$6.7B</span></div>
              <div className="analysis-note"><b>Analyst interpretation</b><p>Data Center is not merely the fastest-growing segment; it now accounts for the majority of revenue and substantially all reported segment-level growth.</p></div>
            </article>

            <article className="panel quality-panel">
              <div className="kicker">Quality scorecard</div>
              <h3>Improving, with one major gate</h3>
              <div className="score-list">
                <div><span>Growth durability</span><i><b style={{ width: "82%" }} /></i><strong>8.2</strong></div>
                <div><span>Operating leverage</span><i><b style={{ width: "78%" }} /></i><strong>7.8</strong></div>
                <div><span>Balance sheet</span><i><b style={{ width: "86%" }} /></i><strong>8.6</strong></div>
                <div><span>Competitive moat</span><i><b style={{ width: "68%" }} /></i><strong>6.8</strong></div>
                <div><span>Capital efficiency</span><i><b className="caution" style={{ width: "61%" }} /></i><strong>6.1</strong></div>
              </div>
              <small className="method-note">Scores are analyst interpretations, not market data. Each score is backed by the claim register.</small>
            </article>

            <article className="panel cash-panel">
              <div className="panel-title-row"><div><div className="kicker">Capital gate</div><h3>Liquidity is strong; obligations are larger</h3></div><span className="risk-flag">Needs modeling</span></div>
              <div className="capital-grid">
                <div><span>Cash + short-term investments</span><b>$13.1B</b></div>
                <div><span>Debt obligations</span><b>$3.3B</b></div>
                <div className="wide"><span>Unconditional commitments</span><b>$30.3B</b><small>$17.4B due during the remainder of FY2026</small></div>
              </div>
              <p className="capital-question"><span>Open model question</span> What are normalized free cash flow and returns on invested capacity after purchase commitments, future leases and customer warrant dilution?</p>
            </article>
          </section>
        )}

        {activeTab === "report" && (
          <section className="report-layout">
            <article className="panel report-paper">
              <div className="report-masthead"><span>Evidence Desk Research</span><span>13 August 2026</span></div>
              <div className="report-title"><div><span>NASDAQ · AMD</span><h2>Advanced Micro Devices</h2><p>Preliminary initiation · Business quality and competitive position</p></div><div className="report-rating"><span>Research posture</span><b>WATCHLIST</b><small>Evidence confidence 84%</small></div></div>
              <div className="report-callout"><b>Net read</b><p>AMD’s business quality is improving as Data Center becomes the primary revenue and profit engine. A positive ownership conclusion still requires proof that rack-scale AI growth produces durable after-financing cash returns.</p></div>
              <div className="report-columns">
                <section><h3>Investment thesis</h3><ol><li><b>Data Center crossed the mix threshold.</b> It represented 58% of Q2 revenue and grew 107% year over year.</li><li><b>The product scope is expanding.</b> AMD is moving from components toward CPUs, GPUs, networking and rack-scale systems.</li><li><b>Capital efficiency is the decision gate.</b> Commitments, future leases and warrant dilution must be modeled against normalized cash returns.</li></ol></section>
                <section><h3>Key disconfirmers</h3><ul><li>Helios adoption remains concentrated or slower than expected.</li><li>Customer incentives rise faster than incremental gross profit.</li><li>ROCm adoption fails to reduce ecosystem switching friction.</li><li>Capacity commitments depress free cash flow through the cycle.</li></ul></section>
              </div>
              <h3 className="report-section-title">Evidence posture</h3>
              <p className="report-body">This is a research-grade, preliminary initiation based on AMD’s FY2025 Form 10-K, Q2 2026 earnings release and Q2 2026 Form 10-Q. Current consensus estimates, ownership data and a full valuation model are not yet included; no target price or investment recommendation is implied.</p>
              <div className="report-footnotes">Sources: [S1] AMD Q2 2026 earnings release; [S2] AMD FY2025 Form 10-K; [S3] AMD Q2 2026 Form 10-Q. Reported facts, derived calculations, management claims and analyst interpretations are distinguished in the evidence map.</div>
            </article>

            <aside className="panel report-outline">
              <div className="kicker">Report builder</div>
              <h3>Initiation outline</h3>
              <ul>
                <li className="done"><span>✓</span> Executive read</li>
                <li className="done"><span>✓</span> Thesis & debates</li>
                <li className="done"><span>✓</span> Business quality</li>
                <li className="done"><span>✓</span> Competitive position</li>
                <li className="done"><span>✓</span> Risks & disconfirmers</li>
                <li><span>6</span> Valuation framework <small>Source gap</small></li>
                <li><span>7</span> Peer comparison <small>Source gap</small></li>
              </ul>
              <button className="run-button full" onClick={copyBrief}>{copied ? "Brief copied" : "Copy report summary"}</button>
              <p>Next data request: current consensus, historical valuation and share-count bridge.</p>
            </aside>
          </section>
        )}
      </section>
    </main>
  );
}
