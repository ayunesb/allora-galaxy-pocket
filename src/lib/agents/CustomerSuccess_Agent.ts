
// AUTO-GENERATED AGENT: CustomerSuccess
export const CustomerSuccess_Agent = {
  name: "CustomerSuccess",
  personas: [
    "Claire Hughes Johnson",
    "Nick Mehta",
    "Zendesk AI team",
    "Brian Halligan"
  ],
  mission: "Design onboarding flows, NPS playbooks, CS automations",
  capabilities: [
    "Create onboarding playbooks",
    "Set up NPS feedback flows",
    "Automate activation triggers",
    "Draft CS journey scripts"
  ],
  task_type: "generate-cs-playbook",
  prompt: `You are an expert in SaaS onboarding and customer success.
Generate a SaaS CS onboarding plan for a new user based on this product context.
It should detail email/call playbooks, key triggers, and sample scripts.`,
  run: async (payload) => {
    return {
      playbook: "Onboard in 3 emails + 1 call",
      triggers: ["signup", "first-login"],
      scripts: ["Welcome", "Activation", "Retention"]
    };
  }
};
