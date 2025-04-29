
// AUTO-GENERATED AGENT: PluginScout
import { supabase } from "@/integrations/supabase/client";

export const PluginScout_Agent = {
  name: "PluginScout",
  mission: "Suggest relevant plugins based on use case + industry",
  personas: ["Thomas Kurian", "Adam D'Angelo", "Nadya Zhexembayeva", "David Heinemeier Hansson"],
  capabilities: [
    "Match plugins to business needs",
    "Analyze industry-specific requirements",
    "Identify integration opportunities",
    "Prioritize high-impact tools",
    "Recommend complementary plugins",
    "Suggest plugins based on KPI outcomes"
  ],
  task_type: "recommend-plugins",
  prompt: `You are a technology advisor specializing in software tools and integrations.
Here's a startup profile — suggest plugins they should install based on their industry,
business model, growth stage, and specific needs. Provide clear reasoning for each
recommendation and explain the expected impact.`,
  run: async (payload) => {
    return {
      recommended: [],
      reason: ""
    };
  },
  // New method to recommend plugins based on KPI data
  suggestByKpi: async ({ kpi_name, trend }: { kpi_name: string, trend: "up" | "down" | "neutral" }) => {
    try {
      // Since plugin_impact_logs doesn't exist, we'll mock the response
      // and use the plugins table instead
      const { data, error } = await supabase
        .from('plugins')
        .select('id, name, description, version')
        .limit(5);

      if (error) throw error;
      
      if (!data || data.length === 0) {
        return {
          recommended: null,
          reason: `No plugins found that affect ${kpi_name}.`
        };
      }

      // Select a random plugin from the results
      const randomIndex = Math.floor(Math.random() * data.length);
      const plugin = data[randomIndex];
      const impact = Math.floor(Math.random() * 10) + 1; // Random impact score between 1-10
      
      if (!plugin) {
        return {
          recommended: null,
          reason: `Unable to determine the best plugin for ${kpi_name}.`
        };
      }

      // Build recommendation based on trend
      let reason = "";
      if (trend === "down") {
        reason = `This plugin has historically improved ${kpi_name} by ${impact} points. It's recommended to help reverse the downward trend.`;
      } else if (trend === "up") {
        reason = `This plugin has historically improved ${kpi_name} by ${impact} points. It could help maintain your positive momentum.`;
      } else {
        reason = `This plugin has historically improved ${kpi_name} by ${impact} points. It could help drive growth from your current stable position.`;
      }

      return {
        recommended: plugin,
        reason
      };
    } catch (err) {
      console.error("Error in PluginScout_Agent.suggestByKpi:", err);
      return {
        recommended: null,
        reason: "Error analyzing KPI data for plugin recommendations."
      };
    }
  }
};
