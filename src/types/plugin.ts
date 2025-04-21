
export interface Plugin {
  key: 'stripe' | 'hubspot' | 'shopify' | 'ga4' | 'twilio';
  label: string;
  description: string;
}
