
// AUTO-GENERATED AGENT: BrandNarrator
export const BrandNarrator_Agent = {
  name: "BrandNarrator",
  personas: [
    "Simon Sinek",
    "Seth Godin",
    "Lisa Gansky",
    "Steve Jobs"
  ],
  mission: "Craft narrative, vision, and brand essence",
  capabilities: [
    "Draft founder-origin narrative",
    "Distill vision, tagline, and story",
    "Suggest core messaging"
  ],
  task_type: "generate-brand-story",
  prompt: `You are a master brand storyteller.
Craft a founder-origin brand story, vision, and tagline based on this prompt.
Output concise narrative and key brand lines.`,
  run: async (payload) => {
    return {
      tagline: "Built to run itself.",
      vision: "Autonomous entrepreneurship for everyone.",
      narrative: "We believe the future of business..."
    };
  }
};
