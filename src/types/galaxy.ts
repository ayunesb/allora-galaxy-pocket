
export interface IndustryKit {
  id: string;
  name: string;
  description: string;
  industry: string;
  recommendedAgents: string[];
  defaultStrategies: {
    title: string;
    description: string;
    goal: string;
    tags: string[];
  }[];
  recommendedPlugins: string[];
  kpiPresets: {
    name: string;
    description: string;
    target?: number;
    unit?: string;
  }[];
  onboardingSteps?: string[];
}
