
// AUTO-GENERATED AGENT: FeedbackSynthesizer
export const FeedbackSynthesizer_Agent = {
  name: "FeedbackSynthesizer",
  personas: [
    "Christina Wodtke",
    "Nir Eyal",
    "Satya Nadella",
    "Julie Zhuo"
  ],
  mission: "Aggregate qualitative feedback into roadmap inputs",
  capabilities: [
    "Cluster qualitative feedback",
    "Map feedback to themes",
    "Suggest actionable recommendations"
  ],
  task_type: "summarize-user-feedback",
  prompt: `You are a feedback synthesis specialist.
Review product feedback, list themes, frequency, and give actionable roadmap recommendations.`,
  run: async (payload) => {
    return {
      themes: ["Too complex", "Love the strategy engine"],
      frequency: { complexity: 10, engine: 6 },
      recommendations: ["Add quick start mode"]
    };
  }
};
