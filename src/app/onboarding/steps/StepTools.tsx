
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { Tool, OnboardingProfile } from "@/types/onboarding";
import StepTemplate from "./StepTemplate";

type Props = {
  next: (data: Partial<OnboardingProfile>) => void;
  back: () => void;
  profile: OnboardingProfile;
};

export default function StepTools({ next, back, profile }: Props) {
  const [selected, setSelected] = React.useState<Tool[]>(profile.tools || []);

  const tools = [
    { value: 'crm' as Tool, label: 'CRM Software' },
    { value: 'analytics' as Tool, label: 'Analytics Tools' },
    { value: 'shopify' as Tool, label: 'Shopify' },
    { value: 'hubspot' as Tool, label: 'HubSpot' },
    { value: 'mailchimp' as Tool, label: 'Mailchimp' },
    { value: 'stripe' as Tool, label: 'Stripe Payments' }
  ];

  const toggleTool = (value: Tool) => {
    setSelected(current => 
      current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value]
    );
  };

  const handleNext = () => {
    next({ tools: selected });
  };

  return (
    <StepTemplate
      title="Which tools do you currently use?"
      description="Select all that apply"
      showBack
      onBack={back}
      onNext={handleNext}
    >
      <div className="grid grid-cols-2 gap-4">
        {tools.map((tool) => (
          <div key={tool.value} className="flex items-center space-x-2">
            <Checkbox 
              id={tool.value}
              checked={selected.includes(tool.value)}
              onCheckedChange={() => toggleTool(tool.value)}
            />
            <Label htmlFor={tool.value}>{tool.label}</Label>
          </div>
        ))}
      </div>
    </StepTemplate>
  );
}
