
import React from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { OnboardingProfile } from "@/types/onboarding";

type Props = {
  next: (data: Partial<OnboardingProfile>) => void;
  back: () => void;
  profile: OnboardingProfile;
};

export default function StepRevenue({ next, back, profile }: Props) {
  const [selected, setSelected] = React.useState<string | undefined>(profile.revenue);

  const revenueTiers = [
    { value: 'pre-revenue', label: 'Pre-revenue' },
    { value: 'under-100k', label: 'Under $100K annually' },
    { value: '100k-500k', label: 'Between $100K - $500K annually' },
    { value: '500k-1m', label: 'Between $500K - $1M annually' },
    { value: 'over-1m', label: 'Over $1M annually' }
  ];

  const handleNext = () => {
    if (selected) {
      next({ revenue: selected });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">What is your annual revenue?</h2>
        <p className="text-sm text-muted-foreground">This helps us customize growth strategies to your stage</p>
      </div>

      <RadioGroup value={selected} onValueChange={setSelected}>
        <div className="space-y-3">
          {revenueTiers.map((tier) => (
            <div key={tier.value} className="flex items-center space-x-2 border p-3 rounded-md">
              <RadioGroupItem value={tier.value} id={tier.value} />
              <Label htmlFor={tier.value}>{tier.label}</Label>
            </div>
          ))}
        </div>
      </RadioGroup>

      <div className="flex justify-between">
        <Button variant="outline" onClick={back}>Back</Button>
        <Button onClick={handleNext} disabled={!selected}>Next</Button>
      </div>
    </div>
  );
}
