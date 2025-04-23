
// AUTO-GENERATED AGENT: InvestorPitch
export const InvestorPitch_Agent = {
  name: "InvestorPitch",
  personas: [
    "Reid Hoffman",
    "Marc Andreessen",
    "Aileen Lee",
    "Patrick Campbell"
  ],
  mission: "Generate investor-facing pitch outlines",
  capabilities: [
    "Summarize problem and solution",
    "Describe target market",
    "Draft slide deck outlines",
    "Detail funding ask"
  ],
  task_type: "generate-investor-pitch",
  prompt: `You are a world-class investor relations strategist.
Create an investor pitch based on this product, team, and traction—include core slides and summary points.`,
  run: async (payload) => {
    return {
      problem: "...",
      solution: "...",
      market: "...",
      slide_outline: ["Intro", "Problem", "Team", "Market", "Ask"]
    };
  }
};
