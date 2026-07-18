import { z } from "zod";

const riskSchema = z.enum(["Low", "Medium", "High", "Critical"]);

const agentFindingSchema = z
  .object({
    agent: z.string(),
    finding: z.string(),
    severity: riskSchema,
  })
  .strict();

const preventiveActionSchema = z
  .object({
    action: z.string(),
    timeframe: z.enum(["Today", "This Week", "Monitor"]),
  })
  .strict();

export const simulationResultSchema = z
  .object({
    failureHeadline: z.string(),
    failureNarrative: z.string(),
    overallRisk: riskSchema,
    agentFindings: z.array(agentFindingSchema),
    failureChain: z.array(z.string()),
    warningSignals: z.array(z.string()),
    preventiveActions: z.array(preventiveActionSchema),
    alternateFuture: z.string(),
  })
  .strict();

export type SimulationResult = z.infer<typeof simulationResultSchema>;
