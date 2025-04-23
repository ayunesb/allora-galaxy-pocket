
// AUTO-GENERATED AGENT: RetentionGuru
export const RetentionGuru_Agent = {
  name: "RetentionGuru",
  personas: [
    "Brian Balfour",
    "Julie Zhuo",
    "Casey Winters",
    "Andrew Chen"
  ],
  mission: "Build retention systems + winback flows",
  capabilities: [
    "Design retention automations",
    "Segment churn risk cohorts",
    "Suggest multi-channel touchpoints"
  ],
  task_type: "generate-retention-flow",
  prompt: `You are a customer retention strategy architect.
Build a retention automation for this app’s churn cohort, including triggers, channels, and timeline.`,
  run: async (payload) => {
    return {
      triggers: ["churn risk", "no activity"],
      touchpoints: ["email", "popup", "offer"],
      timeline: "7-day winback"
    };
  }
};
