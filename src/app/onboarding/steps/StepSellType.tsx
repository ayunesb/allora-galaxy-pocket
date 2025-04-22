
import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { SellType, OnboardingProfile } from "@/types/onboarding";
import StepTemplate from "./StepTemplate";

type Props = {
  next: (data: Partial<OnboardingProfile>) => void;
  back: () => void;
  profile: OnboardingProfile;
};

export default function StepSellType({ next, back, profile }: Props) {
  const [selected, setSelected] = React.useState<SellType | undefined>(profile.sellType);

  const sellTypes = [
    { 
      value: 'products' as SellType, 
      label: 'Products', 
      description: 'Physical or digital products that customers purchase' 
    },
    { 
      value: 'services' as SellType, 
      label: 'Services', 
      description: 'Professional services, consulting, or expertise' 
    },
    { 
      value: 'both' as SellType, 
      label: 'Both Products & Services', 
      description: 'A combination of products and services' 
    }
  ];

  const handleNext = () => {
    if (selected) {
      next({ sellType: selected });
    }
  };

  return (
    <StepTemplate
      title="What do you sell?"
      description="Select what best describes your business offering"
      showBack
      onBack={back}
      onNext={handleNext}
      nextDisabled={!selected}
    >
      <RadioGroup value={selected} onValueChange={(value) => setSelected(value as SellType)}>
        <div className="space-y-3">
          {sellTypes.map((type) => (
            <div key={type.value} className="flex items-start space-x-2 border p-3 rounded-md">
              <RadioGroupItem value={type.value} id={type.value} className="mt-1"/>
              <div className="grid gap-1.5">
                <Label htmlFor={type.value} className="font-medium">{type.label}</Label>
                <p className="text-sm text-muted-foreground">{type.description}</p>
              </div>
            </div>
          ))}
        </div>
      </RadioGroup>
    </StepTemplate>
  );
}
