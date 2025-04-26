
import { OnboardingProfile } from "@/types/onboarding";

export const validateStep = (step: number, data: Partial<OnboardingProfile>): string | null => {
  switch (step) {
    case 0: // Company details
      if (!data.companyName || !data.companyName.trim()) {
        return "Company name is required";
      }
      break;
      
    case 1: // Industry
      if (!data.industry) {
        return "Please select an industry";
      }
      break;
      
    case 2: // Team size
      if (!data.teamSize) {
        return "Please select your team size";
      }
      break;
      
    case 3: // Revenue
      if (!data.revenue) {
        return "Please select your revenue range";
      }
      break;
      
    case 4: // Sell type
      if (!data.sellType) {
        return "Please select what you sell";
      }
      break;
      
    case 5: // Tone
      if (!data.tone) {
        return "Please select your brand tone";
      }
      break;
      
    case 6: // Challenges
      if (!data.challenges || data.challenges.length === 0) {
        return "Please add at least one business challenge";
      }
      break;
      
    case 7: // Channels
      if (!data.channels || data.channels.length === 0) {
        return "Please select at least one marketing channel";
      }
      break;
      
    case 9: // Goals
      if (!data.goals || data.goals.length === 0) {
        return "Please add at least one business goal";
      }
      break;
      
    case 10: // Launch mode
      if (!data.launch_mode) {
        return "Please select a launch mode";
      }
      break;
  }
  
  return null;
};
