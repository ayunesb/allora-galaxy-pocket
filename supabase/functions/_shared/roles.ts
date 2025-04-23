
/**
 * Role to Allowed Agent Tasks mapping for Edge Functions.
 */
export const AGENT_TASK_ACCESS: Record<string, string[]> = {
  client: ["generate-strategy", "generate-campaign"],
  developer: ["generate-strategy", "generate-campaign", "generate-plugin", "tune-prompt"],
  admin: ["*"]
};
