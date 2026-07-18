export type SimulationResult = {
  failureHeadline: string;
  failureNarrative: string;
  overallRisk: "Low" | "Medium" | "High" | "Critical";
  agentFindings: Array<{
    agent: string;
    finding: string;
    severity: "Low" | "Medium" | "High" | "Critical";
  }>;
  failureChain: string[];
  warningSignals: string[];
  preventiveActions: Array<{
    action: string;
    timeframe: "Today" | "This Week" | "Monitor";
  }>;
  alternateFuture: string;
};

export const mockSimulationResult: SimulationResult = {
  failureHeadline: "The product worked. The launch disappeared without a trace.",
  failureNarrative:
    "Three months after launch, the code-review tool had earned praise from a handful of developers but only six teams were paying. Building consumed nearly every available hour, leaving no repeatable way to reach, onboard, or retain the small teams it was designed for.",
  overallRisk: "Critical",
  agentFindings: [
    {
      agent: "Operations Investigator",
      finding:
        "A solo founder became the bottleneck for product development, support, onboarding, and sales. Each new customer increased service work faster than recurring revenue.",
      severity: "High",
    },
    {
      agent: "Human Behaviour Investigator",
      finding:
        "Small teams liked the promise but resisted adding another review step. Without immediate proof of value, developers returned to familiar pull-request habits after the trial.",
      severity: "High",
    },
    {
      agent: "Technical Investigator",
      finding:
        "Early reviews produced too many low-value comments and missed repository context. Trust eroded before the model and rules could be tuned for each team.",
      severity: "Critical",
    },
    {
      agent: "Skeptic",
      finding:
        "The goal assumed product quality would create distribution. With no audience and a limited budget, there was no credible path to reach enough qualified teams in ninety days.",
      severity: "Critical",
    },
  ],
  failureChain: [
    "The founder spends six weeks polishing the review engine before testing demand.",
    "Launch reaches a small, mostly friendly audience and produces few qualified trials.",
    "Early teams encounter noisy feedback and require hands-on onboarding.",
    "Support work crowds out sales conversations and product improvements.",
    "Trial conversion stalls, referrals never compound, and the 50-team target is missed.",
  ],
  warningSignals: [
    "Fewer than 15 customer interviews completed before launch",
    "Trial teams ignore more than 30% of generated comments",
    "Founder-led onboarding takes over two hours per team",
    "Fewer than five qualified trials begin each week",
    "No repeatable acquisition channel by the end of month one",
  ],
  preventiveActions: [
    {
      action: "Recruit five design-partner teams before building additional features.",
      timeframe: "Today",
    },
    {
      action: "Define one narrow review use case and the signal that proves it saves time.",
      timeframe: "Today",
    },
    {
      action: "Run concierge reviews manually to learn what teams consider useful feedback.",
      timeframe: "This Week",
    },
    {
      action: "Create a lightweight founder-led outreach rhythm with weekly trial targets.",
      timeframe: "This Week",
    },
    {
      action: "Track comment acceptance, weekly active repositories, and trial conversion.",
      timeframe: "Monitor",
    },
    {
      action: "Cap onboarding time and pause acquisition if support exceeds capacity.",
      timeframe: "Monitor",
    },
  ],
  alternateFuture:
    "The founder narrows the product to security-focused pull-request checks, recruits five design partners, and tunes every review against real team feedback. A simple case study becomes the foundation for targeted outreach. By month three, 24 teams are paying, conversion is improving, and the business has a credible path to 50 without overwhelming its founder.",
};
