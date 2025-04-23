
// Map of role to allowed agent tasks
export const AGENT_TASK_ACCESS: Record<string, string[]> = {
  client: ["generate-strategy", "generate-campaign"],
  developer: ["generate-strategy", "generate-campaign", "generate-plugin", "tune-prompt"],
  admin: ["*"] // Admin can do all tasks by default
};
