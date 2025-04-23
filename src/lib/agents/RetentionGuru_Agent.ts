
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
Build a retention automation for this app's churn cohort, including triggers, channels, and timeline.`,
  run: async ({ appDescription, churnCohort }: { appDescription: string, churnCohort: string }) => {
    try {
      const res = await fetch("/functions/v1/generate-retention-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appDescription, churnCohort }),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("[RetentionGuru_Agent.run] API error:", errorText);
        throw new Error(`API error: ${res.status}`);
      }
      
      const data = await res.json();
      console.log("[RetentionGuru_Agent.run] retention plan generated:", data);
      
      return {
        triggers: data.triggers || ["churn risk", "no activity"],
        touchpoints: data.touchpoints || ["email", "popup", "offer"],
        timeline: data.timeline || "7-day winback",
        fullPlan: data.fullPlan || ""
      };
    } catch (error) {
      console.error("[RetentionGuru_Agent.run] Error:", error);
      return {
        triggers: ["churn risk", "no activity"],
        touchpoints: ["email", "popup", "offer"],
        timeline: "7-day winback",
        fullPlan: "Error generating retention plan. Please try again."
      };
    }
  }
};
