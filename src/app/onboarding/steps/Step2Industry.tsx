
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OnboardingProfile, Industry } from "@/types/onboarding";

const industries: { value: Industry; label: string }[] = [
  { value: "tech", label: "Technology" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "healthcare", label: "Healthcare" },
  { value: "finance", label: "Finance" },
  { value: "education", label: "Education" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "retail", label: "Retail" },
  { value: "other", label: "Other" },
];

type Props = {
  next: (data: Partial<OnboardingProfile>) => void;
  back: () => void;
  profile: OnboardingProfile;
};

export default function Step2Industry({ next, back, profile }: Props) {
  const [selected, setSelected] = React.useState<Industry | undefined>(
    profile.industry
  );

  const handleNext = () => {
    if (selected) {
      next({ industry: selected });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-lg font-medium">Select your industry</h2>
        <Select
          value={selected}
          onValueChange={(value) => setSelected(value as Industry)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose an industry" />
          </SelectTrigger>
          <SelectContent>
            {industries.map((industry) => (
              <SelectItem key={industry.value} value={industry.value}>
                {industry.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={back}>
          Back
        </Button>
        <Button onClick={handleNext} disabled={!selected}>
          Next
        </Button>
      </div>
    </div>
  );
}
