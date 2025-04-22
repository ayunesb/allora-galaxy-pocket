
import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { TeamSize, OnboardingProfile } from "@/types/onboarding";
import StepTemplate from "./StepTemplate";

type Props = {
  next: (data: Partial<OnboardingProfile>) => void;
  back: () => void;
  profile: OnboardingProfile;
};

export default function StepTeamSize({ next, back, profile }: Props) {
  const [selected, setSelected] = React.useState<TeamSize | undefined>(profile.teamSize);

  const teamSizes = [
    { value: 'solo' as TeamSize, label: 'Solo Entrepreneur' },
    { value: '2-5' as TeamSize, label: 'Small Team (2-5 people)' },
    { value: '5-10' as TeamSize, label: 'Growing Team (5-10 people)' },
    { value: '10+' as TeamSize, label: 'Established Team (10+ people)' }
  ];

  const handleNext = () => {
    if (selected) {
      next({ teamSize: selected });
    }
  };

  return (
    <StepTemplate
      title="What is your team size?"
      description="This helps us tailor our recommendations to your capacity"
      showBack
      onBack={back}
      onNext={handleNext}
      nextDisabled={!selected}
    >
      <RadioGroup value={selected} onValueChange={(value) => setSelected(value as TeamSize)}>
        <div className="space-y-3">
          {teamSizes.map((size) => (
            <div key={size.value} className="flex items-center space-x-2 border p-3 rounded-md">
              <RadioGroupItem value={size.value} id={size.value} />
              <Label htmlFor={size.value}>{size.label}</Label>
            </div>
          ))}
        </div>
      </RadioGroup>
    </StepTemplate>
  );
}
