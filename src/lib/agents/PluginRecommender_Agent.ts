
export const PluginRecommender_Agent = {
  name: "PluginRecommender_Agent",
  mission: "Suggest plugins based on KPI outcomes",
  task_type: "plugin-recommend",
  run: async ({ kpi_name }: { kpi_name: string }) => {
    const res = await fetch("/functions/v1/plugin-recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kpi_name }),
    });
    const data = await res.json();
    console.log("[PluginRecommender_Agent.run] recommendations:", data.recommendations);
    return { recommendations: data.recommendations };
  }
};
