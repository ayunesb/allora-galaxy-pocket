
import { Plugin } from '@/types/plugin';

export const pluginList: Plugin[] = [
  {
    id: "1",
    key: "stripe",
    name: "Stripe",
    description: "Billing and usage metering",
    version: "1.0.0",
    icon: "💳"
  },
  {
    id: "2",
    key: "twilio",
    name: "Twilio",
    description: "SMS follow-ups + reminders",
    version: "1.0.0",
    icon: "📱"
  },
  {
    id: "3",
    key: "hubspot",
    name: "HubSpot",
    description: "CRM + lead syncing",
    version: "1.0.0",
    icon: "📇"
  }
];
