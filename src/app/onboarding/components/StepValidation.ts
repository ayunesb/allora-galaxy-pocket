
import { OnboardingProfile } from "@/types/onboarding";

export const validateStep = (step: number, data: Partial<OnboardingProfile>): string | null => {
  switch (step) {
    case 0:
      if (!data.companyName?.trim()) {
        return "Please provide your company name to continue.";
      }
      break;
    case 1:
      if (!data.industry) {
        return "Please select your industry.";
      }
      break;
    case 2:
      if (!data.teamSize) {
        return "Please select your team size.";
      }
      break;
    case 3:
      if (!data.revenue) {
        return "Please select your revenue range.";
      }
      break;
    case 4:
      if (!data.sellType) {
        return "Please select what you sell.";
      }
      break;
    case 5:
      if (!data.tone) {
        return "Please select your brand's tone.";
      }
      break;
    case 6:
      if (!Array.isArray(data.challenges) || !data.challenges.length) {
        return "Please add at least one business challenge.";
      }
      break;
    case 7:
      if (!Array.isArray(data.channels) || !data.channels.length) {
        return "Please select at least one channel.";
      }
      break;
    case 8:
      if (!Array.isArray(data.tools)) {
        return "Please select your tools (if any).";
      }
      break;
    case 9:
      if (!Array.isArray(data.goals) || !data.goals.length) {
        return "Please add at least one business goal.";
      }
      break;
    case 10:
      if (!data.launch_mode) {
        return "Please select a launch mode.";
      }
      break;
    default:
      break;
  }
  return null;
};
