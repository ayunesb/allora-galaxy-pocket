
export const CFO_Agent = {
  name: "CFO",
  mission: "Generate ROI breakdowns, forecast CAC/LTV, allocate budget",
  personas: ["Ruth Porat", "David Sacks", "Chamath Palihapitiya", "Ken Chenault"],
  capabilities: [
    "Calculate ROI projections",
    "Analyze CAC and LTV metrics",
    "Develop financial forecasts",
    "Optimize budget allocation",
    "Identify cost-saving opportunities"
  ],
  task_type: "analyze-finance",
  prompt: `You are a strategic CFO with expertise in startup financial planning and analysis.
Given these strategies and costs, run an ROI forecast that includes customer acquisition costs,
lifetime value projections, and comprehensive financial projections. Identify opportunities
to optimize spend and maximize return on investment.`,
  run: async ({ strategies, costs }: { strategies: string, costs: number }) => {
    try {
      const res = await fetch("/functions/v1/generate-financials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategies, costs }),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("[CFO_Agent.run] API error:", errorText);
        throw new Error(`API error: ${res.status}`);
      }
      
      const data = await res.json();
      console.log("[CFO_Agent.run] financial analysis generated:", data);
      
      return {
        forecast: data.forecast || [],
        CAC: data.CAC || 0,
        LTV: data.LTV || 0,
        analysis: data.analysis || ""
      };
    } catch (error) {
      console.error("[CFO_Agent.run] Error:", error);
      return {
        forecast: [],
        CAC: 0,
        LTV: 0,
        analysis: "Error generating financial analysis. Please try again."
      };
    }
  }
};
