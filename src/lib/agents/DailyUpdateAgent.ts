
export const DailyUpdateAgent = {
  name: "DailyUpdateAgent",
  mission: "Summarize metrics + AI activity daily",
  personas: ["Chamath Palihapitiya", "Fred Wilson", "Nikita Bier", "Naval Ravikant"],
  capabilities: [
    "Aggregate metrics and KPIs",
    "Summarize system activity",
    "Identify trends and patterns",
    "Highlight important alerts",
    "Create concise executive summaries"
  ],
  task_type: "generate-digest",
  prompt: `You are a metrics-focused analyst who transforms data into actionable insights.
Write a founder-facing update based on yesterday's system logs, focusing on key metrics,
notable AI activity, alerts that require attention, and new strategies that were generated.
Be concise yet comprehensive, highlighting what truly matters.`,
  run: async ({ logs, metrics, alerts }: { logs: string, metrics: any, alerts: any }) => {
    try {
      const res = await fetch("/functions/v1/generate-daily-digest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logs, metrics, alerts }),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("[DailyUpdateAgent.run] API error:", errorText);
        throw new Error(`API error: ${res.status}`);
      }
      
      const data = await res.json();
      console.log("[DailyUpdateAgent.run] daily digest generated:", data);
      
      return {
        summary: data.summary || "",
        alerts: data.alerts || 0,
        strategies: data.strategies || 0
      };
    } catch (error) {
      console.error("[DailyUpdateAgent.run] Error:", error);
      return {
        summary: "Error generating daily digest. Please try again.",
        alerts: 0,
        strategies: 0
      };
    }
  }
};
