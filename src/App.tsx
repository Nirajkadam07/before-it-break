import { useEffect, useState, type FormEvent } from "react";
import SimulationResultView from "./SimulationResultView";
import { mockSimulationResult } from "./simulation";

type FormData = {
  plan: string;
  success: string;
  deadline: string;
  constraints: string;
};

type FormErrors = Partial<Record<"plan" | "success", string>>;
type ViewState = "form" | "loading" | "result";

const initialFormData: FormData = {
  plan: "",
  success: "",
  deadline: "",
  constraints: "",
};

function App() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [view, setView] = useState<ViewState>("form");

  useEffect(() => {
    if (view !== "loading") {
      return;
    }

    const simulationTimer = window.setTimeout(() => setView("result"), 1500);

    return () => window.clearTimeout(simulationTimer);
  }, [view]);

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));

    if ((field === "plan" || field === "success") && value.trim()) {
      setErrors((current) => ({ ...current, [field]: undefined }));
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
      console.log("Pre-mortem form data:", formData);
      setView("loading");
    }
  };

  const runAnotherSimulation = () => {
    setFormData(initialFormData);
    setErrors({});
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

            <button className="primary-button" type="submit">
              Simulate the future
            </button>
          </form>
        )}

        {view === "loading" && (
          <div className="simulation-loading" role="status" aria-live="polite">
            <span className="loading-indicator" aria-hidden="true" />
            <p>Simulating the failed future...</p>
            <span>Investigators are tracing what went wrong.</span>
          </div>
        )}

        {view === "result" && (
          <SimulationResultView
            result={mockSimulationResult}
            onRestart={runAnotherSimulation}
          />
        )}
      </section>
    </main>
  );
}

export default App;
