import type { SimulationResult } from "./simulation";

type SimulationResultViewProps = {
  result: SimulationResult;
  onRestart: () => void;
};

const timeframes: Array<
  SimulationResult["preventiveActions"][number]["timeframe"]
> = ["Today", "This Week", "Monitor"];

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
        <div>
          <p className="result-kicker">Failed future / 90 days later</p>
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
          <p>Independent review</p>
          <h3 id="findings-title">What the investigators found</h3>
        </div>
        <div className="agent-grid">
          {result.agentFindings.map((item) => (
            <article className="agent-card" key={item.agent}>
              <div className="agent-card__header">
                <h4>{item.agent}</h4>
                <span className={severityClass(item.severity)}>
                  {item.severity}
                </span>
              </div>
              <p>{item.finding}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="result-columns">
        <section className="result-section" aria-labelledby="chain-title">
          <div className="section-heading">
            <p>How it unfolded</p>
            <h3 id="chain-title">Failure chain</h3>
          </div>
          <ol className="failure-chain">
            {result.failureChain.map((step, index) => (
              <li key={step}>
                <span className="chain-number">{index + 1}</span>
                <p>{step}</p>
                {index < result.failureChain.length - 1 && (
                  <span className="chain-arrow" aria-hidden="true">
                    {"\u2193"}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </section>

        <section className="result-section warning-section" aria-labelledby="signals-title">
          <div className="section-heading">
            <p>Watch closely</p>
            <h3 id="signals-title">Warning signals</h3>
          </div>
          <ul className="signal-list">
            {result.warningSignals.map((signal) => (
              <li key={signal}>{signal}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className="result-section" aria-labelledby="actions-title">
        <div className="section-heading">
          <p>Change the trajectory</p>
          <h3 id="actions-title">Preventive actions</h3>
        </div>
        <div className="action-groups">
          {timeframes.map((timeframe) => (
            <div className="action-group" key={timeframe}>
              <h4>{timeframe}</h4>
              <ul>
                {result.preventiveActions
                  .filter((item) => item.timeframe === timeframe)
                  .map((item) => (
                    <li key={item.action}>{item.action}</li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="alternate-future" aria-labelledby="alternate-title">
        <p>Alternate future</p>
        <h3 id="alternate-title">The failure was prevented.</h3>
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
