import type { SimulationResult } from "./simulation";

type SimulationResultViewProps = {
  result: SimulationResult;
  onRestart: () => void;
};

const timeframes: Array<
  SimulationResult["preventiveActions"][number]["timeframe"]
> = ["Today", "This Week", "Monitor"];

const investigatorIcons: Record<string, string> = {
  "Operations Investigator": "documentation-icon",
  "Human Behaviour Investigator": "social-icon",
  "Technical Investigator": "technical-icon",
  Skeptic: "skeptic-icon",
};

function severityClass(severity: SimulationResult["overallRisk"]) {
  return `severity severity--${severity.toLowerCase()}`;
}

function SimulationResultView({
  result,
  onRestart,
}: SimulationResultViewProps) {
  return (
    <article className="simulation-result" aria-labelledby="failure-headline">
      <header className="result-hero">
        <div className="result-hero__main">
          <p className="result-kicker">Simulated future</p>
          <h2 id="failure-headline">{result.failureHeadline}</h2>
          <p className="failure-narrative">{result.failureNarrative}</p>
        </div>
        <div className="risk-summary">
          <span>Overall risk</span>
          <strong className={severityClass(result.overallRisk)}>
            {result.overallRisk}
          </strong>
        </div>
      </header>

      <section className="result-section" aria-labelledby="findings-title">
        <div className="section-heading">
          <p>Why it failed</p>
          <h3 id="findings-title">Four investigators, four points of failure</h3>
        </div>
        <div className="agent-grid">
          {result.agentFindings.map((item, index) => (
            <article className="agent-card" key={`${item.agent}-${index}`}>
              <div className="agent-card__header">
                <div className="agent-identity">
                  <span className={`agent-icon agent-icon--${index + 1}`}>
                    <svg aria-hidden="true">
                      <use
                        href={`/icons.svg#${investigatorIcons[item.agent] ?? "documentation-icon"}`}
                      />
                    </svg>
                  </span>
                  <h4>{item.agent}</h4>
                </div>
                <span className={severityClass(item.severity)}>
                  {item.severity}
                </span>
              </div>
              <p>{item.finding}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        className="result-section chain-section"
        aria-labelledby="chain-title"
      >
        <div className="section-heading section-heading--centerpiece">
          <p>How failure compounded</p>
          <h3 id="chain-title">The failure chain</h3>
          <span>One weak signal triggered the next.</span>
        </div>
        <ol className="failure-chain">
          {result.failureChain.map((step, index) => (
            <li key={`${step}-${index}`}>
              <span className="chain-number">{index + 1}</span>
              <p>{step}</p>
            </li>
          ))}
        </ol>
      </section>

      <section
        className="result-section warning-section"
        aria-labelledby="signals-title"
      >
        <div className="section-heading">
          <p>Catch it early</p>
          <h3 id="signals-title">Warning signals to watch</h3>
        </div>
        <ul className="warning-grid">
          {result.warningSignals.map((signal, index) => (
            <li key={`${signal}-${index}`}>
              <span className="warning-marker" aria-hidden="true">
                !
              </span>
              <span>{signal}</span>
            </li>
          ))}
        </ul>
      </section>

      <section
        className="result-section action-section"
        aria-labelledby="actions-title"
      >
        <div className="section-heading">
          <p>What to do now</p>
          <h3 id="actions-title">Prevention plan</h3>
        </div>
        <div className="action-groups">
          {timeframes.map((timeframe) => (
            <div
              className={`action-group action-group--${timeframe.toLowerCase().replace(" ", "-")}`}
              key={timeframe}
            >
              <div className="action-group__heading">
                <h4>{timeframe}</h4>
                {timeframe === "Today" && <span>Start here</span>}
              </div>
              <ul>
                {result.preventiveActions
                  .filter((item) => item.timeframe === timeframe)
                  .map((item, index) => (
                    <li key={`${item.action}-${index}`}>
                      <span className="action-marker" aria-hidden="true" />
                      <span>{item.action}</span>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="alternate-future" aria-labelledby="alternate-title">
        <p>Alternate future</p>
        <h3 id="alternate-title">The future after intervention</h3>
        <p>{result.alternateFuture}</p>
      </section>

      <div className="result-footer">
        <button className="secondary-button" type="button" onClick={onRestart}>
          Run another simulation
        </button>
      </div>
    </article>
  );
}

export default SimulationResultView;
