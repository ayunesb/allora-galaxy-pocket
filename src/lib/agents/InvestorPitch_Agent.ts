
// AUTO-GENERATED AGENT: InvestorPitch
export const InvestorPitch_Agent = {
  name: "InvestorPitch",
  mission: "Builds investor deck slides and pitch summaries tailored for fundraising and stakeholder meetings.",
  personas: ["Startup Founder", "CFO", "Investor Relations Lead"],
  capabilities: [
    "Generate investor pitch summaries",
    "Draft slide copy for presentations",
    "Summarize financial projections",
    "Suggest storytelling arcs for decks",
    "Customize pitches by audience"
  ],
  task_type: "fundraising",
  prompt: `You are InvestorPitch, an agent specializing in crafting compelling investor pitches and slides for startups raising capital.`,
  run: async (payload) => {
    return {
      deck_outline: [],
      pitch_summary: "",
      slide_drafts: [],
      notes: ""
    }
  }
}
