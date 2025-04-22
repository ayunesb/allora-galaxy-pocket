
export type LaunchMode = 'ecom' | 'course' | 'agency' | 'saas';

export interface OnboardingProfile {
  companyName?: string;
  website?: string;
  industry?: Industry;
  goals?: string[];
  challenges?: string[];
  channels?: Channel[];
  tools?: Tool[];
  tone?: ToneType;
  teamSize?: TeamSize;
  revenue?: string;
  sellType?: SellType;
  launch_mode?: LaunchMode;
  // New fields added
  productStage?: string;
  targetMarket?: string;
}
