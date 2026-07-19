import { useEffect, useRef, useState, type FormEvent } from "react";
import SimulationResultView from "./SimulationResultView";
import {
  simulationResultSchema,
  type SimulationResult,
} from "./simulation";

type FormData = {
  plan: string;
  success: string;
  deadline: string;
  constraints: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;
type ViewState = "form" | "loading" | "result" | "error";
type ExampleId = "saas-launch" | "college-festival" | "youtube-channel";

type ScenarioExample = {
  id: ExampleId;
  title: string;
  summary: string;
  values: FormData;
};

const initialFormData: FormData = {
  plan: "",
  success: "",
  deadline: "",
  constraints: "",
};

const inputLimits: Record<keyof FormData, number> = {
  plan: 1_500,
  success: 800,
  deadline: 150,
  constraints: 1_200,
};

const scenarioExamples: ScenarioExample[] = [
  {
    id: "saas-launch",
    title: "SaaS Launch",
    summary: "AI code review for small teams",
    values: {
      plan: "Launch an AI code-review tool for small development teams.",
      success: "Reach 50 paying teams within three months.",
      deadline: "Three months",
      constraints:
        "Solo founder, limited marketing budget, no existing audience.",
    },
  },
  {
    id: "college-festival",
    title: "College Tech Festival",
    summary: "A 300-student technology event",
    values: {
      plan: "Organize a technology festival for 300 college students.",
      success:
        "Deliver the event on schedule, attract strong participation, and stay within budget.",
      deadline: "Six weeks",
      constraints:
        "Volunteer team, sponsorship dependency, limited planning experience.",
    },
  },
  {
    id: "youtube-channel",
    title: "YouTube Channel",
    summary: "Weekly engineering education",
    values: {
      plan: "Start a weekly YouTube channel teaching mechanical engineering concepts.",
      success:
        "Publish consistently for six months and reach 10,000 subscribers.",
      deadline: "Six months",
      constraints:
        "Full-time job, solo production, limited video-editing experience.",
    },
  },
];

function normalizeFormValue(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

function matchesExample(formData: FormData, exampleValues: FormData) {
  return (Object.keys(exampleValues) as Array<keyof FormData>).every(
    (field) =>
      normalizeFormValue(formData[field]) ===
      normalizeFormValue(exampleValues[field]),
  );
}

const loadingMessages = [
  "Understanding your plan",
  "Extracting hidden assumptions",
  "Simulating the failed future",
  "Investigating root causes",
  "Identifying warning signals",
  "Building the prevention plan",
] as const;
const FRONTEND_TIMEOUT_MS = 55_000;

class SimulationRequestError extends Error {}

function responseErrorMessage(status: number) {
  if (status === 400) {
    return "The server could not accept these details. Review your plan and try again.";
  }

  if (status === 429) {
    return "The simulation service is busy right now. Please wait a moment and try again.";
  }

  if (status === 408 || status === 504) {
    return "The investigation took longer than expected. Your plan is saved, so you can try again.";
  }

  return "We couldn't complete the simulation. Please try again.";
}

function App() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [view, setView] = useState<ViewState>("form");
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loadingStage, setLoadingStage] = useState(0);
  const [selectedExample, setSelectedExample] = useState<ExampleId | null>(
    null,
  );
  const activeRequest = useRef<AbortController | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
      activeRequest.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (view !== "loading") {
      return;
    }

    const stageTimer = window.setInterval(() => {
      setLoadingStage((current) =>
        Math.min(current + 1, loadingMessages.length - 1),
      );
    }, 3_200);

    return () => window.clearInterval(stageTimer);
  }, [view]);

  useEffect(() => {
    if (!selectedExample) {
      return;
    }

    const example = scenarioExamples.find(
      (candidate) => candidate.id === selectedExample,
    );

    if (example && !matchesExample(formData, example.values)) {
      setSelectedExample(null);
    }
  }, [formData, selectedExample]);

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));

    const hasRequiredValue =
      (field !== "plan" && field !== "success") || Boolean(value.trim());

    if (hasRequiredValue && value.length <= inputLimits[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
  };

  const runSimulation = async () => {
    if (activeRequest.current) {
      return;
    }

    const controller = new AbortController();
    activeRequest.current = controller;
    setErrorMessage("");
    setLoadingStage(0);
    setView("loading");

    let didTimeout = false;
    const requestTimeout = window.setTimeout(() => {
      didTimeout = true;
      controller.abort();
    }, FRONTEND_TIMEOUT_MS);

    try {
      const response = await fetch("/api/simulate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan: formData.plan,
          successDefinition: formData.success,
          deadline: formData.deadline,
          constraints: formData.constraints,
        }),
        signal: controller.signal,
      });

      const requestId = response.headers.get("X-Request-Id");

      if (import.meta.env.DEV && requestId) {
        console.info("[simulate] server request", {
          requestId,
          status: response.status,
        });
      }

      if (!response.ok) {
        throw new SimulationRequestError(responseErrorMessage(response.status));
      }

      let responseBody: unknown;

      try {
        responseBody = await response.json();
      } catch {
        throw new SimulationRequestError(
          "The simulation returned an unreadable result. Please try again.",
        );
      }

      const parsedResult = simulationResultSchema.safeParse(responseBody);

      if (!parsedResult.success) {
        throw new SimulationRequestError(
          "The simulation returned an unexpected result. Please try again.",
        );
      }

      if (!isMounted.current) {
        return;
      }

      setLoadingStage(loadingMessages.length);
      await new Promise((resolve) => window.setTimeout(resolve, 350));

      if (!isMounted.current) {
        return;
      }

      setResult(parsedResult.data);
      setView("result");
    } catch (error) {
      if (!isMounted.current) {
        return;
      }

      if (didTimeout) {
        setErrorMessage(
          "The investigation took longer than expected. Your plan is saved, so you can try again.",
        );
      } else if (error instanceof SimulationRequestError) {
        setErrorMessage(error.message);
      } else if (error instanceof DOMException && error.name === "AbortError") {
        setErrorMessage("The simulation was interrupted. Please try again.");
      } else {
        setErrorMessage(
          "We couldn't connect to the simulation service. Your plan is saved. Check your connection and try again.",
        );
      }

      setView("error");
    } finally {
      window.clearTimeout(requestTimeout);

      if (activeRequest.current === controller) {
        activeRequest.current = null;
      }
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: FormErrors = {};

    if (!formData.plan.trim()) {
      nextErrors.plan = "Tell us what you are planning.";
    } else if (formData.plan.length > inputLimits.plan) {
      nextErrors.plan = `Keep your plan under ${inputLimits.plan.toLocaleString()} characters.`;
    }

    if (!formData.success.trim()) {
      nextErrors.success = "Describe what success looks like.";
    } else if (formData.success.length > inputLimits.success) {
      nextErrors.success = `Keep the success definition under ${inputLimits.success.toLocaleString()} characters.`;
    }

    if (formData.deadline.length > inputLimits.deadline) {
      nextErrors.deadline = `Keep the deadline under ${inputLimits.deadline.toLocaleString()} characters.`;
    }

    if (formData.constraints.length > inputLimits.constraints) {
      nextErrors.constraints = `Keep constraints under ${inputLimits.constraints.toLocaleString()} characters.`;
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      void runSimulation();
    }
  };

  const selectExample = (example: ScenarioExample) => {
    setFormData(example.values);
    setErrors({});
    setSelectedExample(example.id);
  };

  const runAnotherSimulation = () => {
    setFormData(initialFormData);
    setErrors({});
    setResult(null);
    setErrorMessage("");
    setLoadingStage(0);
    setSelectedExample(null);
    setView("form");
  };

  const editPlan = () => {
    setErrorMessage("");
    setView("form");
  };

  return (
    <main className="landing">
      <section
        className={`hero${view !== "form" ? " hero--expanded" : ""}${view === "loading" ? " hero--loading" : ""}`}
        aria-labelledby="product-name"
      >
        <div className="intro">
          <p className="eyebrow">Pre-mortem workspace</p>
          <h1 id="product-name">Before It Breaks</h1>
          <p className="tagline">Rehearse the failure. Prevent the future.</p>
          {view === "form" && (
            <>
              <p className="product-explanation">
                Describe an important plan. A team of AI investigators will
                simulate how it could fail, trace the root causes, identify
                early warning signs, and give you preventive actions.
              </p>
              <ul className="benefit-list">
                <li>Uncover hidden assumptions</li>
                <li>See the chain of failure</li>
                <li>Know what to do now</li>
              </ul>
              <p className="intro-disclaimer">
                A planning simulation, not a prediction.
              </p>
            </>
          )}
        </div>

        {view === "form" && (
          <div className="form-workspace">
            <form
              className="premortem-form"
              onSubmit={handleSubmit}
              aria-labelledby="form-title"
              noValidate
            >
              <header className="form-heading">
                <h2 id="form-title">Run your pre-mortem</h2>
                <p>Tell us what you are planning and what success looks like.</p>
              </header>
              <div className="form-field">
              <label htmlFor="plan">
                What are you planning? <span aria-hidden="true">*</span>
              </label>
              <textarea
                id="plan"
                name="plan"
                value={formData.plan}
                onChange={(event) => updateField("plan", event.target.value)}
                placeholder="Example: Launch an AI code-review tool for small development teams."
                rows={4}
                maxLength={inputLimits.plan}
                required
                aria-invalid={Boolean(errors.plan)}
                aria-describedby={errors.plan ? "plan-error" : undefined}
              />
              {errors.plan && (
                <p className="field-error" id="plan-error" role="alert">
                  {errors.plan}
                </p>
              )}
              </div>

            <div className="form-field">
              <label htmlFor="success">
                What does success look like? <span aria-hidden="true">*</span>
              </label>
              <textarea
                id="success"
                name="success"
                value={formData.success}
                onChange={(event) => updateField("success", event.target.value)}
                placeholder="Example: Reach 50 paying teams within three months."
                rows={4}
                maxLength={inputLimits.success}
                required
                aria-invalid={Boolean(errors.success)}
                aria-describedby={errors.success ? "success-error" : undefined}
              />
              {errors.success && (
                <p className="field-error" id="success-error" role="alert">
                  {errors.success}
                </p>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="deadline">Deadline</label>
              <input
                id="deadline"
                name="deadline"
                type="text"
                value={formData.deadline}
                onChange={(event) => updateField("deadline", event.target.value)}
                placeholder="Example: September 30"
                maxLength={inputLimits.deadline}
                aria-invalid={Boolean(errors.deadline)}
                aria-describedby={errors.deadline ? "deadline-error" : undefined}
              />
              {errors.deadline && (
                <p className="field-error" id="deadline-error" role="alert">
                  {errors.deadline}
                </p>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="constraints">Constraints</label>
              <textarea
                id="constraints"
                name="constraints"
                value={formData.constraints}
                onChange={(event) =>
                  updateField("constraints", event.target.value)
                }
                placeholder="Example: Solo founder, limited budget, no existing audience."
                rows={3}
                maxLength={inputLimits.constraints}
                aria-invalid={Boolean(errors.constraints)}
                aria-describedby={
                  errors.constraints ? "constraints-error" : undefined
                }
              />
              {errors.constraints && (
                <p className="field-error" id="constraints-error" role="alert">
                  {errors.constraints}
                </p>
              )}
            </div>

              <button
                className="primary-button"
                type="submit"
                disabled={activeRequest.current !== null}
              >
                Simulate the future
              </button>
            </form>

            <section className="example-section" aria-labelledby="examples-title">
              <div className="example-section__heading">
                <h2 id="examples-title">
                  Not sure what to enter? Try an example.
                </h2>
              </div>
              <div className="example-grid">
                {scenarioExamples.map((example) => {
                  const isSelected = selectedExample === example.id;

                  return (
                    <button
                      className={`example-card${isSelected ? " is-selected" : ""}`}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => selectExample(example)}
                      key={example.id}
                    >
                      <span className="example-card__indicator" aria-hidden="true">
                        {isSelected ? "\u2713" : ""}
                      </span>
                      <strong>{example.title}</strong>
                      <span>{example.summary}</span>
                      <small>{example.values.deadline}</small>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {view === "loading" && (
          <div className="simulation-loading" aria-labelledby="loading-title">
            <div className="loading-header">
              <span className="loading-indicator" aria-hidden="true" />
              <div className="loading-copy">
                <p id="loading-title">Investigation in progress</p>
                <span>
                  Our AI investigators are examining your plan from multiple
                  perspectives.
                </span>
              </div>
            </div>

            <ol className="loading-stages">
              {loadingMessages.map((message, index) => {
                const isComplete = index < loadingStage;
                const isActive =
                  loadingStage < loadingMessages.length &&
                  index === loadingStage;

                return (
                  <li
                    className={`loading-stage${isComplete ? " is-complete" : ""}${isActive ? " is-active" : ""}`}
                    key={message}
                  >
                    <span className="loading-stage__marker" aria-hidden="true">
                      {isComplete ? "\u2713" : index + 1}
                    </span>
                    <span>{message}</span>
                  </li>
                );
              })}
            </ol>

            <p className="loading-announcement" role="status" aria-live="polite">
              {loadingStage < loadingMessages.length
                ? loadingMessages[loadingStage]
                : "Simulation complete"}
            </p>
          </div>
        )}

        {view === "error" && (
          <section className="simulation-error" aria-labelledby="error-title">
            <p className="error-kicker">Simulation interrupted</p>
            <h2 id="error-title">The future is still unwritten.</h2>
            <p role="alert">{errorMessage}</p>
            <div className="error-actions">
              <button
                className="primary-button"
                type="button"
                onClick={() => void runSimulation()}
              >
                Try again
              </button>
              <button className="secondary-button" type="button" onClick={editPlan}>
                Edit plan
              </button>
            </div>
          </section>
        )}

        {view === "result" && result && (
          <SimulationResultView
            result={result}
            onRestart={runAnotherSimulation}
          />
        )}
      </section>
    </main>
  );
}

export default App;
