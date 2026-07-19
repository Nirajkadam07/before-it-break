# Before It Breaks

**Rehearse the failure. Prevent the future.**

Before It Breaks is an AI-powered pre-mortem simulator that turns an open-ended plan into a believable failed future, traces how the failure unfolds, and recommends concrete actions to reduce the risk before execution begins.

> Before It Breaks provides AI-generated planning simulations, not predictions or professional advice.

## Live Demo

- [Live Demo](https://before-it-break.vercel.app/)
- [Demo Video](https://drive.google.com/file/d/1qg2xyETAt746UcHeNHHqUIqaJI3TmZ3X/view?usp=sharing)

## The Problem

Teams naturally plan around success: the launch goes on schedule, customers adopt the product, the event runs smoothly, or the content finds an audience. That framing can leave important assumptions untested until the plan is already in trouble.

Operational bottlenecks, human behaviour, technical weaknesses, and skeptical counterarguments often appear late because they were never examined together as a connected failure path.

## The Solution

Before It Breaks performs an AI-assisted pre-mortem. It assumes the plan has already failed, constructs a plausible account of what happened, and investigates the causes from four coordinated perspectives:

- **Operations Investigator** - examines execution, ownership, resources, dependencies, and process.
- **Human Behaviour Investigator** - examines incentives, adoption, communication, and stakeholder behaviour.
- **Technical Investigator** - examines technical constraints, reliability, complexity, and implementation risks.
- **Skeptic** - challenges assumptions, evidence, timing, and confidence.

These are reasoning perspectives coordinated inside one structured model response. They are not independent autonomous or distributed agents.

## Disclaimer

> **Before It Breaks provides AI-generated planning simulations, not predictions or professional advice.**

## How It Works

1. **Describe the plan.** Explain what you intend to do.
2. **Define success.** State the outcome that would make the plan successful.
3. **Add context.** Optionally provide a deadline and constraints.
4. **Run the investigation.** AI examines the scenario from four perspectives.
5. **Review the simulated future.** See the failure narrative, causal chain, warning signals, and preventive actions.
6. **Print or save the result.** Use the browser's native print dialog to create a PDF or physical copy.

## Key Features

- **Open-ended planning input** - supports real plans rather than forcing users into a fixed risk checklist.
- **Example scenarios** - quickly populate the editable form with SaaS, college-event, or creator scenarios.
- **Multi-perspective investigation** - combines operational, behavioural, technical, and skeptical reasoning.
- **Structured failed future** - presents a headline, narrative, and overall risk level instead of an unorganized response.
- **Causal failure chain** - shows four to six concise events where each step logically leads to the next.
- **Early warning signals** - identifies observable evidence that the simulated failure may be developing.
- **Action-oriented prevention plan** - groups recommendations into Today, This Week, and Monitor.
- **Alternate future** - explains how early intervention could change the outcome.
- **Resilient request flow** - includes loading stages, timeout handling, safe error recovery, and Try Again.
- **Native PDF export** - prints a dedicated result layout without adding a PDF library or backend route.
- **Responsive presentation** - supports desktop and mobile form, loading, error, and result states.

## Why AI Is Core

A deterministic checklist can ask common risk questions, but it cannot reliably interpret the meaning of an arbitrary plan or connect its specific constraints to a plausible sequence of failure.

AI is central to this experience because it can:

- interpret open-ended goals and context;
- uncover assumptions that were not explicitly listed;
- reason across operational, human, technical, and skeptical perspectives;
- connect individual risks into a chronological causal chain;
- identify warning signs specific to the proposed plan; and
- recommend preventive actions that reflect the user's deadline and constraints.

The model output is constrained and validated, but the reasoning remains probabilistic. Results should be treated as prompts for better planning, not facts about the future.

## AI Workflow

1. React validates required fields and enforces input length limits.
2. The frontend sends a JSON `POST` request to `/api/simulate`.
3. The Vercel Function parses and validates the request again with Zod.
4. The server constructs a system prompt and treats scenario fields as untrusted planning data.
5. The official OpenAI Node SDK calls the Responses API.
6. `zodTextFormat` constrains the response to the runtime result schema.
7. The server verifies that parsed output exists and validates it again with Zod.
8. A safe structured result is returned to the frontend.
9. React validates the response shape once more and renders the result interface.

## Result Structure

Each completed simulation contains:

| Section               | Purpose                                                    |
| --------------------- | ---------------------------------------------------------- |
| Failure headline      | Summarizes the simulated failed future.                    |
| Failure narrative     | Explains what went wrong and why it mattered.              |
| Overall risk          | Classifies the scenario as Low, Medium, High, or Critical. |
| Investigator findings | Provides one finding from each of the four perspectives.   |
| Failure chain         | Connects four to six concise causal events.                |
| Warning signals       | Lists observable indicators to watch for early.            |
| Preventive actions    | Groups actions into Today, This Week, and Monitor.         |
| Alternate future      | Describes the outcome after timely intervention.           |

## Tech Stack

| Technology                | Role                                                     |
| ------------------------- | -------------------------------------------------------- |
| React                     | Form, loading, error, and result interfaces.             |
| TypeScript                | Strictly typed frontend and serverless code.             |
| Vite                      | Frontend development and production builds.              |
| CSS                       | Responsive screen and print layouts.                     |
| Vercel Functions          | Server-side `/api/simulate` endpoint.                    |
| OpenAI Node SDK           | Official server-side OpenAI client.                      |
| OpenAI Responses API      | Generates the pre-mortem simulation.                     |
| OpenAI Structured Outputs | Constrains generated data to a predictable shape.        |
| Zod                       | Validates request input and generated output at runtime. |
| Vercel                    | Application and serverless-function deployment.          |

## How OpenAI Codex Was Used

OpenAI Codex was used iteratively throughout development rather than being asked to generate the complete application in one prompt. Its role included:

- inspecting the repository before each change;
- planning focused implementations within the existing architecture;
- building and refining the form, loading, result, and print experiences;
- debugging Responses API and Structured Output integration;
- correcting TypeScript and schema compatibility issues;
- hardening timeouts, retries, request tracing, and error classification;
- running lint, type, build, and endpoint smoke checks;
- reviewing secret handling and repository hygiene; and
- performing the final production-readiness audit.

## Design Decisions

This hackathon prototype intentionally avoids several larger product systems:

- **No authentication** - judges can use the core experience without creating an account.
- **No database persistence** - simulations remain in the current browser session and no personal planning data is stored by the application.
- **No saved history** - keeps the workflow focused on one active pre-mortem.
- **No collaboration layer** - avoids permissions, invitations, and synchronization complexity.
- **No permanent share URLs** - avoids storing or publicly exposing result data.
- **No graph library** - the causal chain uses lightweight React and CSS.
- **No PDF library** - the browser's native print dialog provides Print / Save PDF.

These are scope and reliability decisions for a focused prototype, not claims that the omitted capabilities are unnecessary in a mature product.

## Limitations

- There are no user accounts or access controls.
- Simulation history is not saved.
- Results do not have persistent shareable URLs.
- Output quality depends on the specificity and quality of the supplied context.
- AI-generated scenarios can contain mistakes, omissions, or weak assumptions.
- The simulation supports decision-making but does not replace professional judgement.
- Browser print and PDF output can vary slightly between browsers.

## Future Improvements

- Account-based simulation history
- Persistent shareable results
- Team review and collaboration
- Comparison between multiple simulations of the same plan
- Domain-specific investigator modes
- Reusable export templates
- Usage analytics and stronger abuse controls

These are possible extensions and are not part of the current implementation.

## Hackathon Context

Before It Breaks was built for the NamasteDev hackathon using OpenAI Codex as an iterative engineering collaborator. The project focuses on demonstrating a complete, accessible AI planning workflow rather than a broad platform with account and data-management features.
