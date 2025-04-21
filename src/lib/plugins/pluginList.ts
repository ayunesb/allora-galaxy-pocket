
export type Plugin = {
  key: 'stripe' | 'hubspot' | 'shopify' | 'ga4' | 'twilio';
  name: string;
  description: string;
  version: string;
  icon: string;
};

export const pluginList: Plugin[] = [
  {
    key: "stripe",
    name: "Stripe",
    description: "Billing and usage metering",
    version: "1.0.0",
    icon: "💳"
  },
  {
    key: "twilio",
    name: "Twilio",
    description: "SMS follow-ups + reminders",
    version: "1.0.0",
    icon: "📲"
  },
  {
    key: "hubspot",
    name: "HubSpot",
    description: "CRM + lead syncing",
    version: "1.0.0",
    icon: "📇"
  }
];
