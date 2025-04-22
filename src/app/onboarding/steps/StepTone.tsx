
import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { ToneType, OnboardingProfile } from "@/types/onboarding";
import StepTemplate from "./StepTemplate";

type Props = {
  next: (data: Partial<OnboardingProfile>) => void;
  back: () => void;
  profile: OnboardingProfile;
};

export default function StepTone({ next, back, profile }: Props) {
  const [selected, setSelected] = React.useState<ToneType | undefined>(profile.tone);

  const tones = [
    { value: 'corporate' as ToneType, label: 'Corporate & Professional', description: 'Formal language, industry terminology' },
    { value: 'friendly' as ToneType, label: 'Friendly & Approachable', description: 'Conversational, warm, personable' },
    { value: 'edgy' as ToneType, label: 'Edgy & Bold', description: 'Provocative, attention-grabbing, unique' },
    { value: 'technical' as ToneType, label: 'Technical & Detailed', description: 'Specific, data-focused, precise' }
  ];

  const handleNext = () => {
    if (selected) {
      next({ tone: selected });
    }
  };

  return (
    <StepTemplate
      title="What tone best represents your brand?"
      description="Select the communication style that fits your business"
      showBack
      onBack={back}
      onNext={handleNext}
      nextDisabled={!selected}
    >
      <RadioGroup value={selected} onValueChange={(value) => setSelected(value as ToneType)}>
        <div className="space-y-3">
          {tones.map((tone) => (
            <div key={tone.value} className="flex items-start space-x-2 border p-3 rounded-md">
              <RadioGroupItem value={tone.value} id={tone.value} className="mt-1"/>
              <div className="grid gap-1.5">
                <Label htmlFor={tone.value} className="font-medium">{tone.label}</Label>
                <p className="text-sm text-muted-foreground">{tone.description}</p>
              </div>
            </div>
          ))}
        </div>
      </RadioGroup>
    </StepTemplate>
  );
}
