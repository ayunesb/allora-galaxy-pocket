
import { IndustryKit } from "@/types/galaxy";

export const ecommerceKit: IndustryKit = {
  id: "ecommerce-starter-kit",
  name: "E-commerce Growth Kit",
  description: "Conversion-focused strategies and metrics for online stores",
  industry: "ecommerce",
  recommendedAgents: ["CEO", "Marketing", "Merchandising"],
  
  defaultStrategies: [
    {
      title: "Cart Abandonment Recovery Campaign",
      description: "Multi-channel recovery workflow to recapture abandoned carts through email, SMS, and remarketing.",
      goal: "Recover 15% of abandoned carts within 72 hours",
      tags: ["conversion", "email", "automation"]
    },
    {
      title: "Customer Loyalty Program",
      description: "Tiered rewards system with purchase-based points, exclusive offers, and early access to new products.",
      goal: "Increase repeat purchase rate by 25%",
      tags: ["retention", "loyalty", "revenue"]
    },
    {
      title: "Product Bundle Optimization",
      description: "Create high-margin product bundles based on purchase pattern analysis and complementary item identification.",
      goal: "Increase average order value by 20%",
      tags: ["pricing", "merchandising", "cross-sell"]
    }
  ],
  
  recommendedPlugins: ["shopify", "ga4", "mailchimp"],
  
  kpiPresets: [
    {
      name: "Conversion Rate",
      description: "Percentage of visitors who make a purchase",
      target: 3,
      unit: "percent"
    },
    {
      name: "AOV",
      description: "Average Order Value",
      unit: "currency"
    },
    {
      name: "ROAS",
      description: "Return on Ad Spend",
      target: 4,
      unit: "ratio"
    },
    {
      name: "Cart Abandonment Rate",
      description: "Percentage of carts that are abandoned",
      target: 70,
      unit: "percent"
    },
    {
      name: "Repeat Customer Rate",
      description: "Percentage of customers who return to make another purchase",
      target: 30,
      unit: "percent"
    }
  ],
  
  onboardingSteps: [
    "Connect store analytics",
    "Import product catalog",
    "Set up conversion tracking",
    "Configure abandoned cart recovery"
  ]
};
