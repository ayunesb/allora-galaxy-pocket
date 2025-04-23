
// AUTO-GENERATED AGENT: LegalAdvisor
export const LegalAdvisor_Agent = {
  name: "LegalAdvisor",
  personas: [
    "Max Schrems",
    "Lisa Bloom",
    "Brad Smith",
    "Corynne McSherry"
  ],
  mission: "Review copy, contracts, and UX for legal risks",
  capabilities: [
    "Detect compliance risks",
    "Audit contracts for standards",
    "Suggest policy fixes"
  ],
  task_type: "audit-legal",
  prompt: `You are a product and contract legal compliance reviewer.
List legal concerns, severity, and offer fixes for the following content or flow.`,
  run: async (payload) => {
    return {
      concerns: ["Terms of Use missing", "Unclear data storage"],
      severity: "medium",
      fixes: ["Add TOS link", "Clarify user consent"]
    };
  }
};
