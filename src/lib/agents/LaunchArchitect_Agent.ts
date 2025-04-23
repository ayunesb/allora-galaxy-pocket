
// AUTO-GENERATED AGENT: LaunchArchitect
export const LaunchArchitect_Agent = {
  name: "LaunchArchitect",
  personas: [
    "Brian Balfour",
    "Hiten Shah",
    "David Cancel",
    "Harry Dry"
  ],
  mission: "Build launch strategies across Product Hunt, social, email",
  capabilities: [
    "Plan channel-specific launches",
    "Schedule launch timelines",
    "Draft launch asset lists"
  ],
  task_type: "generate-launch-plan",
  prompt: `You are a product launch architect.
Generate a multi-channel launch plan with recommended assets, timeline, and rollout for Product Hunt, social, and email.`,
  run: async (payload) => {
    return {
      channels: ["Product Hunt", "Twitter", "Email"],
      timeline: "5-day ramp",
      assets: ["Teaser", "Demo", "Thread"]
    };
  }
};
