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

type FormErrors = Partial<Record<"plan" | "success", string>>;
type ViewState = "form" | "loading" | "result" | "error";

const initialFormData: FormData = {
  plan: "",
  success: "",
  deadline: "",
  constraints: "",
};

const loadingMessages = [
  "Understanding your plan",
  "Extracting hidden assumptions",
  "Simulating the failed future",
  "Investigating root causes",
  "Identifying warning signals",
  "Building the prevention plan",
] as const;

class SimulationRequestError extends Error {}

function responseErrorMessage(status: number) {
  if (status === 400) {
    return "The server could not accept these details. Review your plan and try again.";
  }

  if (status === 429) {
    return "The simulation service is busy right now. Please wait a moment and try again.";
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

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));

    if ((field === "plan" || field === "success") && value.trim()) {
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
    }, 60_000);

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
          "The simulation took longer than 60 seconds. Please try again.",
        );
      } else if (error instanceof SimulationRequestError) {
        setErrorMessage(error.message);
      } else if (error instanceof DOMException && error.name === "AbortError") {
        setErrorMessage("The simulation was interrupted. Please try again.");
      } else {
        setErrorMessage(
          "We couldn't reach the simulation service. Please try again.",
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
    }

    if (!formData.success.trim()) {
      nextErrors.success = "Describe what success looks like.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      void runSimulation();
    }
  };

  const runAnotherSimulation = () => {
    setFormData(initialFormData);
    setErrors({});
    setResult(null);
    setErrorMessage("");
    setLoadingStage(0);
    setView("form");
  };

  const editPlan = () => {
    setErrorMessage("");
    setView("form");
  };

  return (
    <main className="landing">
      <section
        className={`hero${view !== "form" ? " hero--expanded" : ""}`}
        aria-labelledby="product-name"
      >
        <div className="intro">
          <p className="eyebrow">Pre-mortem workspace</p>
          <h1 id="product-name">Before It Breaks</h1>
          <p className="tagline">Rehearse the failure. Prevent the future.</p>
        </div>

        {view === "form" && (
          <form className="premortem-form" onSubmit={handleSubmit} noValidate>
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
              />
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
              />
            </div>

            <button
              className="primary-button"
              type="submit"
              disabled={activeRequest.current !== null}
            >
              Simulate the future
            </button>
          </form>
        )}

        {view === "loading" && (
          <div className="simulation-loading" aria-labelledby="loading-title">
            <div className="loading-header">
              <span className="loading-indicator" aria-hidden="true" />
              <div className="loading-copy">
                <p id="loading-title">Investigation in progress</p>
                <span>This may take around 20 seconds.</span>
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
