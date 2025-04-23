
export const RiskForecastAgent = {
  name: "RiskForecast",
  mission: "Assesses business risk scenarios and mitigation strategies",
  personas: ["Ray Dalio", "Nassim Taleb", "Howard Marks", "Warren Buffett"],
  capabilities: [
    "Identify potential business risks",
    "Analyze market threats",
    "Evaluate competitive challenges",
    "Suggest risk mitigation strategies",
    "Conduct scenario planning"
  ],
  task_type: "analyze-risk",
  prompt: `You are a seasoned risk analyst with expertise in business forecasting and scenario planning.
Based on the provided business plan and target segment, identify the key risks that could
impact success. Evaluate each risk's probability and potential impact, then suggest practical
mitigation strategies. Think systematically about market risks, competitive threats,
execution challenges, and black swan events.`,
  run: async ({ plan, segment }: { plan: string, segment: string }) => {
    try {
      const res = await fetch("/functions/v1/analyze-risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, segment }),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("[RiskForecastAgent.run] API error:", errorText);
        throw new Error(`API error: ${res.status}`);
      }
      
      const data = await res.json();
      console.log("[RiskForecastAgent.run] risk analysis generated:", data);
      
      return {
        risks: data.risks || [],
        mitigations: data.mitigations || [],
        riskScore: data.riskScore || 50
      };
    } catch (error) {
      console.error("[RiskForecastAgent.run] Error:", error);
      return {
        risks: [],
        mitigations: ["Error generating risk analysis. Please try again."],
        riskScore: 0
      };
    }
  }
};
