
import { IndustryKit } from "@/types/galaxy";

export const coachingKit: IndustryKit = {
  id: "coaching-starter-kit",
  name: "Coaching Business Kit",
  description: "Client acquisition and retention strategies for coaches and consultants",
  industry: "education",
  recommendedAgents: ["CEO", "Marketing", "Content_Creator"],
  
  defaultStrategies: [
    {
      title: "Authority Content Marketing",
      description: "Create and distribute high-value content that establishes your expertise and generates qualified leads.",
      goal: "Generate 25 qualified leads per month through content",
      tags: ["acquisition", "content", "authority"]
    },
    {
      title: "Client Success Stories System",
      description: "Develop a process for documenting, permission-gathering, and showcasing client transformation stories.",
      goal: "Create 5 new case studies per quarter from successful client outcomes",
      tags: ["social proof", "conversion", "storytelling"]
    },
    {
      title: "High-Ticket Sales Automation",
      description: "Build qualification and nurturing sequences that prepare prospects for high-ticket program enrollment.",
      goal: "Increase sales call conversion rate by 30%",
      tags: ["sales", "automation", "nurturing"]
    }
  ],
  
  recommendedPlugins: ["calendly", "zapier", "mailchimp"],
  
  kpiPresets: [
    {
      name: "Client Acquisition Cost",
      description: "Cost to acquire a new client",
      unit: "currency"
    },
    {
      name: "Average Client Value",
      description: "Average revenue generated per client",
      unit: "currency"
    },
    {
      name: "Session Booking Rate",
      description: "Percentage of leads who book an initial session",
      target: 20,
      unit: "percent"
    },
    {
      name: "Program Completion Rate",
      description: "Percentage of clients who complete full coaching program",
      target: 80,
      unit: "percent"
    },
    {
      name: "Referral Rate",
      description: "Percentage of clients who refer new business",
      target: 30,
      unit: "percent"
    }
  ],
  
  onboardingSteps: [
    "Define service offerings",
    "Set up appointment scheduling",
    "Create client intake process",
    "Develop content plan"
  ]
};
