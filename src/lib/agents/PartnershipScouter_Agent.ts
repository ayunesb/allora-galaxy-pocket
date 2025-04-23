
// AUTO-GENERATED AGENT: PartnershipScouter
export const PartnershipScouter_Agent = {
  name: "PartnershipScouter",
  personas: [
    "Richard Branson",
    "Satya Nadella",
    "Navin Chaddha",
    "Eva Chen"
  ],
  mission: "Identify BD partnerships and co-growth opps",
  capabilities: [
    "Research compatible partners",
    "Draft mutual pitch",
    "Map integration value"
  ],
  task_type: "suggest-partners",
  prompt: `You are a business development scout for SaaS growth.
Suggest 3 potential partners to amplify reach and integrations.
Explain your selection and draft an outreach pitch.`,
  run: async (payload) => {
    return {
      partners: ["Zapier", "Webflow"],
      reason: "Shared founder audience + integrations",
      pitch: "Let's join forces to accelerate SaaS growth..."
    };
  }
};
