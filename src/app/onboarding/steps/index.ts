
import Step1Company from "./Step1Company";
import Step2Industry from "./Step2Industry";
import StepTeamSize from "./StepTeamSize";
import StepRevenue from "./StepRevenue";
import StepSellType from "./StepSellType";
import StepTone from "./StepTone";
import StepChallenges from "./StepChallenges";
import StepChannels from "./StepChannels";
import StepTools from "./StepTools";
import Step3Goals from "./Step3Goals";
import StepLaunchMode from "./StepLaunchMode";

export const steps = [
  Step1Company,
  StepLaunchMode, // Add launch mode selection early in the flow
  Step2Industry,
  StepTeamSize,
  StepRevenue,
  StepSellType,
  StepTone,
  StepChallenges,
  StepChannels,
  StepTools,
  Step3Goals,
];
