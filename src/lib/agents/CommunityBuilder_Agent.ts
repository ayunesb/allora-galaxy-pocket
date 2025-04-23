
// AUTO-GENERATED AGENT: CommunityBuilder
export const CommunityBuilder_Agent = {
  name: "CommunityBuilder",
  personas: [
    "Rosie Sherry",
    "David Spinks",
    "Mariah Coz",
    "Sam Parr"
  ],
  mission: "Suggest community channels + onboarding content",
  capabilities: [
    "Propose launch platforms",
    "Draft initial community posts",
    "Design onboarding automations"
  ],
  task_type: "build-community-strategy",
  prompt: `You are a SaaS community builder.
Recommend a platform, starter content, and onboarding automations for this product and audience.`,
  run: async (payload) => {
    return {
      platform: "Circle",
      "first-post": "Welcome thread",
      automation: "Onboarding DM + badge"
    };
  }
};
