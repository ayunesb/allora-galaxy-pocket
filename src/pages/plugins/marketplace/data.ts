import { Plugin } from "@/types/plugin";

export const categories = [
  { id: "all", label: "All" },
  { id: "billing", label: "Billing" },
  { id: "crm", label: "CRM" },
  { id: "ecommerce", label: "E-commerce" },
  { id: "analytics", label: "Analytics" },
  { id: "communications", label: "Communications" },
  { id: "ai", label: "AI" },
  { id: "automation", label: "Automation" }
];

// Move availablePlugins array here
export const availablePlugins: Plugin[] = [
  { 
    id: "1",
    key: "stripe", 
    name: "Stripe", 
    description: "Payment processing, billing and subscription management",
    category: "billing",
    tags: ["payments", "subscriptions", "billing"],
    version: "1.0.0",
    icon: "💳"
  },
  { 
    id: "2",
    key: "hubspot", 
    name: "HubSpot", 
    description: "CRM integration for contact and lead management",
    category: "crm",
    tags: ["crm", "marketing", "contacts"],
    version: "1.0.0",
    icon: "📊"
  },
  { 
    id: "3",
    key: "shopify", 
    name: "Shopify", 
    description: "E-commerce platform integration for product and order management",
    category: "ecommerce",
    tags: ["ecommerce", "products", "orders"],
    version: "1.0.0",
    icon: "🛍️"
  },
  { 
    id: "4",
    key: "ga4", 
    name: "Google Analytics", 
    description: "Web analytics and reporting integration",
    category: "analytics",
    tags: ["analytics", "tracking", "reporting"],
    version: "1.0.0",
    icon: "📈"
  },
  { 
    id: "5",
    key: "twilio", 
    name: "Twilio", 
    description: "SMS and voice communication integration",
    category: "communications",
    tags: ["sms", "notifications", "messaging"],
    version: "1.0.0",
    icon: "📱"
  },
  { 
    id: "6",
    key: "openai", 
    name: "OpenAI", 
    description: "Advanced AI capabilities with GPT models",
    category: "ai",
    tags: ["ai", "gpt", "machine-learning"],
    version: "2.1.0",
    icon: "🤖"
  },
  { 
    id: "7",
    key: "slack", 
    name: "Slack", 
    description: "Team communication and notifications",
    category: "communications",
    tags: ["team", "chat", "notifications"],
    version: "1.2.0",
    icon: "💬"
  },
  { 
    id: "8",
    key: "zapier", 
    name: "Zapier", 
    description: "Connect with thousands of apps and automate workflows",
    category: "automation",
    tags: ["automation", "integration", "workflow"],
    version: "1.0.0",
    icon: "⚡"
  }
];
