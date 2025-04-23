
// AUTO-GENERATED AGENT: FeatureRoadmap
export const FeatureRoadmap_Agent = {
  name: "FeatureRoadmap",
  personas: [
    "Marissa Mayer",
    "Tom Preston-Werner",
    "Brian Chesky",
    "Christina Wodtke"
  ],
  mission: "Prioritize feature roadmap with metrics",
  capabilities: [
    "Synthesize user requests",
    "Model timeline for features",
    "Prioritize by impact"
  ],
  task_type: "generate-product-roadmap",
  prompt: `You are a product management expert.
Generate a roadmap based on these user requests, strategy, and growth goals.
Rank features, show timeline, and group by priority.`,
  run: async (payload) => {
    return {
      timeline: "Q2–Q3",
      features: ["AI sync", "Stripe v2"],
      priority_matrix: ["Quick win", "Revenue lever", "Long-term moat"]
    };
  }
};
