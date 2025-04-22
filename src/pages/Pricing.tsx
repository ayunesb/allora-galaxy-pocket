
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Check } from "lucide-react";

interface Plan {
  name: string;
  price: number;
  planId: string;
  features: string[];
  description: string;
}

const plans: Plan[] = [
  {
    name: "Standard",
    price: 199,
    planId: "price_standard_plan",
    description: "Perfect for founders just getting started",
    features: [
      "1 AI Strategy/month",
      "Campaign previews",
      "AI Assistant (limited)",
      "Basic onboarding"
    ]
  },
  {
    name: "Growth",
    price: 499,
    planId: "price_growth_plan",
    description: "For teams ready to scale with AI",
    features: [
      "5 Strategies/month",
      "AI Agent Execution",
      "CRM Integrations",
      "Weekly KPI Summary"
    ]
  },
  {
    name: "Pro (AI Auto)",
    price: 999,
    planId: "price_pro_plan",
    description: "Full automation for established businesses",
    features: [
      "Unlimited Strategies",
      "Full automation engine",
      "Slack/Webhook Alerts",
      "Shopify Autopilot",
      "Export API + Memory"
    ]
  }
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const calculatePrice = (basePrice: number) => {
    if (billingCycle === "yearly") {
      return Math.round(basePrice * 12 * 0.8);
    }
    return basePrice;
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <header className="text-center space-y-4 mb-12">
          <h1 className="text-4xl font-bold tracking-tight">Simple, transparent pricing</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your business. All plans include a 7-day free trial.
          </p>
          
          <div className="flex justify-center pt-6">
            <ToggleGroup 
              type="single" 
              value={billingCycle}
              onValueChange={(value) => value && setBillingCycle(value as "monthly" | "yearly")}
              aria-label="Billing cycle"
            >
              <ToggleGroupItem value="monthly" aria-label="Monthly billing">
                Monthly
              </ToggleGroupItem>
              <ToggleGroupItem value="yearly" aria-label="Yearly billing">
                Yearly (20% off)
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </header>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card key={plan.planId} className="relative flex flex-col">
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${calculatePrice(plan.price)}</span>
                  <span className="text-muted-foreground ml-2">
                    /{billingCycle === "monthly" ? "mo" : "yr"}
                  </span>
                </div>
                <p className="text-xs text-emerald-600 font-medium mt-2">
                  🎁 Includes 7-day free trial
                </p>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full mt-6" size="lg">
                  Get started
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
