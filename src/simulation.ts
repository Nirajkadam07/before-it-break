import { z } from "zod";

const riskSchema = z.enum(["Low", "Medium", "High", "Critical"]);
const agentSchema = z.enum([
  "Operations Investigator",
  "Human Behaviour Investigator",
  "Technical Investigator",
  "Skeptic",
]);

const agentFindingSchema = z
  .object({
    agent: agentSchema,
    finding: z.string().trim().min(1).max(700),
    severity: riskSchema,
  })
  .strict();

const preventiveActionSchema = z
  .object({
    action: z.string().trim().min(1).max(300),
    timeframe: z.enum(["Today", "This Week", "Monitor"]),
  })
  .strict();

export const simulationResultSchema = z
  .object({
    failureHeadline: z.string().trim().min(1).max(240),
    failureNarrative: z.string().trim().min(1).max(1_500),
    overallRisk: riskSchema,
    agentFindings: z.array(agentFindingSchema).length(4),
    failureChain: z
      .array(z.string().trim().min(1).max(120))
      .min(4)
      .max(6),
    warningSignals: z
      .array(z.string().trim().min(1).max(300))
      .min(1)
      .max(8),
    preventiveActions: z.array(preventiveActionSchema).min(3).max(12),
    alternateFuture: z.string().trim().min(1).max(1_200),
  })
  .strict();

export type SimulationResult = z.infer<typeof simulationResultSchema>;
