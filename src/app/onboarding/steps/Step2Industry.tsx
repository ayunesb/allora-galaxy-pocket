
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
import StepTemplate from "./StepTemplate";
import { useIndustryKit } from "@/hooks/useIndustryKit";
import { Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const industries: { value: Industry; label: string }[] = [
  { value: "tech", label: "Technology" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "education", label: "Education" },
  { value: "healthcare", label: "Healthcare" },
  { value: "finance", label: "Finance" },
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
  const { applyKit, isLoading } = useIndustryKit();

  const handleNext = async () => {
    if (selected) {
      // Apply the industry kit before proceeding
      await applyKit(selected);
      next({ industry: selected });
    }
  };

  const getKitBadge = (industry: Industry) => {
    if (industry === "tech") return "SaaS Kit";
    if (industry === "ecommerce") return "E-commerce Kit";
    if (industry === "education") return "Coaching Kit";
    return null;
  };

  return (
    <StepTemplate
      title="Select your industry"
      description="We'll customize your experience based on your industry"
      showBack
      onBack={back}
      onNext={handleNext}
      nextDisabled={!selected || isLoading}
      isLoading={isLoading}
    >
      <div className="space-y-4">
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
                <div className="flex items-center justify-between w-full">
                  <span>{industry.label}</span>
                  {getKitBadge(industry.value) && (
                    <Badge variant="outline" className="ml-2 bg-green-50">
                      {getKitBadge(industry.value)}
                    </Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selected && (getKitBadge(selected)) && (
          <div className="p-4 bg-muted rounded-md border">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="h-4 w-4 text-primary" />
              <h3 className="font-medium">Vertical Starter Kit Included</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Your selection includes a pre-configured industry kit with 
              specialized strategies, KPIs, and agent configurations.
            </p>
          </div>
        )}
      </div>
    </StepTemplate>
  );
}
