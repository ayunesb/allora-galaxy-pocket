
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
      // Fetch plugins that have had impact on the specified KPI
      const { data, error } = await supabase
        .from("plugin_impact_logs")
        .select("plugin_id, delta")
        .eq("kpi_affected", kpi_name);

      if (error) throw error;
      
      if (!data || data.length === 0) {
        return {
          recommended: null,
          reason: `No plugins found that affect ${kpi_name}.`
        };
      }

      // Rank plugins by their impact on the KPI
      const ranked = data.reduce((acc, row) => {
        acc[row.plugin_id] = (acc[row.plugin_id] || 0) + row.delta;
        return acc;
      }, {} as Record<string, number>);

      // Sort and get the best performing plugin
      const sortedPlugins = Object.entries(ranked).sort((a, b) => b[1] - a[1]);
      const best = sortedPlugins[0];
      
      if (!best) {
        return {
          recommended: null,
          reason: `Unable to determine the best plugin for ${kpi_name}.`
        };
      }

      const plugin_id = best[0];
      const impact = best[1];

      // Get the plugin details
      const { data: plugin, error: pluginError } = await supabase
        .from("plugins")
        .select("*")
        .eq("id", plugin_id)
        .maybeSingle();

      if (pluginError) throw pluginError;

      if (!plugin) {
        return {
          recommended: null,
          reason: `Plugin data not found for id ${plugin_id}.`
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
