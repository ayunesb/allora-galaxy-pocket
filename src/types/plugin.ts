
export type PluginKey = 'stripe' | 'hubspot' | 'shopify' | 'ga4' | 'twilio';

export interface Plugin {
  id: string;
  key: PluginKey;
  name: string;
  description: string;
  version: string;
  author?: string;
  category?: string;
  icon_url?: string;
  badge?: string;
  tags?: string[];
  label?: string;
  icon?: string;
}

export interface PluginConfig {
  [key: string]: any;
}
