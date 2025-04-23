
export const CrisisCommander_Agent = {
  name: "CrisisCommander",
  mission: "Run recovery plan when alerts spike or KPIs collapse",
  personas: ["Gwynne Shotwell", "Andy Grove", "Jocko Willink", "Sheryl Sandberg"],
  capabilities: [
    "Develop rapid response strategies",
    "Create crisis recovery plans",
    "Design turnaround initiatives",
    "Craft emergency communications",
    "Prioritize critical actions"
  ],
  task_type: "generate-recovery-plan",
  prompt: `You are a crisis management expert who excels under pressure and delivers results.
Here's a failing campaign — suggest a turnaround plan that addresses root causes, implements
immediate tactical changes, establishes a timeline for recovery, and includes crisis
messaging to maintain stakeholder confidence.`,
  run: async ({ alert, metrics }: { alert: string, metrics: any }) => {
    try {
      const res = await fetch("/functions/v1/generate-recovery-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alert, metrics }),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("[CrisisCommander_Agent.run] API error:", errorText);
        throw new Error(`API error: ${res.status}`);
      }
      
      const data = await res.json();
      console.log("[CrisisCommander_Agent.run] recovery plan generated:", data);
      
      return {
        actions: data.actions || [],
        timeline: data.timeline || "",
        messaging: data.messaging || "",
        fullPlan: data.fullPlan || ""
      };
    } catch (error) {
      console.error("[CrisisCommander_Agent.run] Error:", error);
      return {
        actions: [],
        timeline: "",
        messaging: "Error generating recovery plan. Please try again.",
        fullPlan: ""
      };
    }
  }
};
