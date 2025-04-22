
import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  ShoppingCart, 
  BookOpen, 
  Briefcase, 
  Code 
} from "lucide-react";
import type { LaunchMode, OnboardingProfile } from "@/types/onboarding";
import StepTemplate from "./StepTemplate";

type Props = {
  next: (data: Partial<OnboardingProfile>) => void;
  back: () => void;
  profile: OnboardingProfile;
};

export default function StepLaunchMode({ next, back, profile }: Props) {
  const [selected, setSelected] = React.useState<LaunchMode | undefined>(
    profile.launch_mode
  );

  const launchModes = [
    {
      value: "ecom" as LaunchMode,
      label: "E-commerce",
      description: "Selling physical or digital products online",
      icon: ShoppingCart,
    },
    {
      value: "course" as LaunchMode,
      label: "Online Course",
      description: "Knowledge products, coaching, and education",
      icon: BookOpen,
    },
    {
      value: "agency" as LaunchMode,
      label: "Agency",
      description: "Client services, consulting, and project work",
      icon: Briefcase,
    },
    {
      value: "saas" as LaunchMode,
      label: "SaaS",
      description: "Software as a service with recurring revenue",
      icon: Code,
    },
  ];

  const handleNext = () => {
    if (selected) {
      next({ launch_mode: selected });
    }
  };

  return (
    <StepTemplate
      title="Choose your launch mode"
      description="This will customize your growth strategy"
      showBack
      onBack={back}
      onNext={handleNext}
      nextDisabled={!selected}
      nextLabel="Finish"
    >
      <RadioGroup
        value={selected}
        onValueChange={(value) => setSelected(value as LaunchMode)}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {launchModes.map((mode) => (
            <div
              key={mode.value}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selected === mode.value
                  ? "border-primary bg-primary/5"
                  : "hover:border-primary/50"
              }`}
              onClick={() => setSelected(mode.value)}
            >
              <RadioGroupItem
                value={mode.value}
                id={mode.value}
                className="sr-only"
              />
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <mode.icon className="h-6 w-6" />
                </div>
                <Label htmlFor={mode.value} className="font-medium">
                  {mode.label}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {mode.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </RadioGroup>
    </StepTemplate>
  );
}
