export type TeamSize = 'solo' | '2-5' | '5-10' | '10+';
export type SellType = 'products' | 'services' | 'both';
export type ToneType = 'corporate' | 'friendly' | 'edgy' | 'technical';
export type Channel = 'email' | 'whatsapp' | 'instagram' | 'linkedin' | 'twitter' | 'tiktok';
export type Tool = 'crm' | 'analytics' | 'shopify' | 'hubspot' | 'mailchimp' | 'stripe';
export type Industry = 
  | 'tech'
  | 'ecommerce'
  | 'healthcare'
  | 'finance'
  | 'education'
  | 'manufacturing'
  | 'retail'
  | 'other';

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
  productStage?: string;
  targetMarket?: string;
}
