
import { IndustryKit } from "@/types/galaxy";

export const saasKit: IndustryKit = {
  id: "saas-starter-kit",
  name: "SaaS Growth Kit",
  description: "Optimized strategies and KPIs for Software-as-a-Service businesses",
  industry: "tech",
  recommendedAgents: ["CEO", "Marketing", "Customer_Success"],
  
  defaultStrategies: [
    {
      title: "Reduce CAC With Multi-Channel Attribution",
      description: "Implement proper attribution across channels to identify highest ROI acquisition sources and optimize ad spend.",
      goal: "Reduce customer acquisition cost by 20% while maintaining growth rate",
      tags: ["acquisition", "analytics", "optimization"]
    },
    {
      title: "Implement Product-Led Growth Funnel",
      description: "Create a self-serve onboarding flow that allows users to experience value before requiring payment information.",
      goal: "Increase trial-to-paid conversion rate by 30%",
      tags: ["product", "conversion", "onboarding"]
    },
    {
      title: "Customer Success Automation",
      description: "Build automated customer check-ins and feature education emails triggered by usage patterns.",
      goal: "Reduce churn rate by 15% through proactive engagement",
      tags: ["retention", "automation", "customer success"]
    }
  ],
  
  recommendedPlugins: ["ga4", "stripe", "intercom"],
  
  kpiPresets: [
    {
      name: "MRR",
      description: "Monthly Recurring Revenue",
      unit: "currency"
    },
    {
      name: "CAC",
      description: "Customer Acquisition Cost",
      unit: "currency"
    },
    {
      name: "LTV",
      description: "Customer Lifetime Value",
      unit: "currency"
    },
    {
      name: "Churn Rate",
      description: "Monthly customer cancellation rate",
      target: 5,
      unit: "percent"
    },
    {
      name: "Trial Conversion Rate",
      description: "Percentage of trials that convert to paid accounts",
      target: 20,
      unit: "percent"
    }
  ],
  
  onboardingSteps: [
    "Connect analytics",
    "Import customer data",
    "Set up revenue tracking",
    "Create first automation"
  ]
};
