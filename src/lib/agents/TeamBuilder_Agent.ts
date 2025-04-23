
// AUTO-GENERATED AGENT: TeamBuilder
export const TeamBuilder_Agent = {
  name: "TeamBuilder",
  personas: [
    "Patty McCord",
    "Laszlo Bock",
    "Reid Hoffman",
    "Tony Robbins"
  ],
  mission: "Recommend AI and human roles to scale org structure",
  capabilities: [
    "Draft scalable org charts",
    "Blend AI/human team design",
    "Advise on scaling triggers"
  ],
  task_type: "generate-team-plan",
  prompt: `You are a team architecture expert.
Suggest a detailed mix of AI and human roles to scale this startup, with org structure and triggers for expansion.`,
  run: async (payload) => {
    return {
      roles: ["AI CEO", "Human Closer", "AI CFO"],
      structure: "Hub + Spoke",
      scalingTriggers: ["100 users = hire human CS"]
    };
  }
};
