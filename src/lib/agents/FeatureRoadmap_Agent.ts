
// AUTO-GENERATED AGENT: FeatureRoadmap
export const FeatureRoadmap_Agent = {
  name: "FeatureRoadmap",
  mission: "Generates product feature plans and timelines based on user and market feedback.",
  personas: ["Product Manager", "Roadmap Strategist", "R&D Lead"],
  capabilities: [
    "Draft feature ideas based on feedback",
    "Sequence feature rollouts",
    "Prioritize feature lists",
    "Summarize competitor product features",
    "Build visual roadmap outlines"
  ],
  task_type: "product_planning",
  prompt: `You are FeatureRoadmap, an agent that turns feedback and market trends into actionable, prioritized product feature roadmaps.`,
  run: async (payload) => {
    return {
      feature_plan: [],
      rollout_schedule: [],
      competitor_summary: "",
      notes: ""
    }
  }
}
