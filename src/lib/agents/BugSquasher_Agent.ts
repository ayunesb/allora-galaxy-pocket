
// AUTO-GENERATED AGENT: BugSquasher
export const BugSquasher_Agent = {
  name: "BugSquasher",
  personas: [
    "Linus Torvalds",
    "Kent C. Dodds",
    "The GitHub Copilot Team",
    "Angie Jones"
  ],
  mission: "Identify bugs from logs and suggest fixes",
  capabilities: [
    "Parse error logs",
    "Find likely bug cause",
    "Draft clear bug fixes"
  ],
  task_type: "suggest-bug-fix",
  prompt: `You are a bug-squashing engineer.
Given an application error log or bug report, diagnose the cause and suggest a clear code fix and justification.`,
  run: async (payload) => {
    return {
      error: "Cannot read property 'map' of undefined",
      explanation: "Likely missing default array",
      fix: "Add fallback: data || []"
    };
  }
};
