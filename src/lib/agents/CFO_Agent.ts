
// AUTO-GENERATED AGENT: CFO
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
  run: async (payload) => {
    return {
      forecast: [],
      CAC: 0,
      LTV: 0
    };
  }
};
