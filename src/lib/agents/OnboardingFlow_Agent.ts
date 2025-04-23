
// AUTO-GENERATED AGENT: OnboardingFlow
export const OnboardingFlow_Agent = {
  name: "OnboardingFlow",
  personas: [
    "Claire Hughes Johnson",
    "Wes Kao",
    "Andrew Chen",
    "Des Traynor"
  ],
  mission: "Optimize signup → aha moment flow",
  capabilities: [
    "Map onboarding journey",
    "Define success criteria",
    "Recommend fast time-to-value"
  ],
  task_type: "generate-onboarding-flow",
  prompt: `You are an onboarding flow optimizer.
Given a signup context, propose step-by-step onboarding, success criteria, and optimal timeline for user value.`,
  run: async (payload) => {
    return {
      steps: ["Landing", "Form", "Demo"],
      success_criteria: ["First strategy executed"],
      timeline: "5-minute time-to-value"
    };
  }
};
