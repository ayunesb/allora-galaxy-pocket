
import React from "react";
import { useForm } from "react-hook-form";
import { LaunchMode } from "@/types/onboarding";
import { Building, Store, GraduationCap, BriefcaseIcon } from "lucide-react";
import StepTemplate from "./StepTemplate";

interface LaunchModeFormData {
  launch_mode: LaunchMode;
}

interface LaunchModeStepProps {
  next: (data: LaunchModeFormData) => void;
  back: () => void;
  profile: { launch_mode?: LaunchMode };
}

const modes = [
  { 
    value: 'saas', 
    label: 'SaaS Business',
    icon: Building,
    description: 'Software-as-a-Service company focused on recurring revenue' 
  },
  { 
    value: 'ecom', 
    label: 'E-commerce Store',
    icon: Store,
    description: 'Online retail business selling products' 
  },
  { 
    value: 'course', 
    label: 'Online Course',
    icon: GraduationCap,
    description: 'Digital education and training products' 
  },
  { 
    value: 'agency', 
    label: 'Agency/Services',
    icon: BriefcaseIcon,
    description: 'Professional services and consulting' 
  }
];

export default function StepLaunchMode({ next, back, profile }: LaunchModeStepProps) {
  const { handleSubmit, setValue, watch } = useForm<LaunchModeFormData>({
    defaultValues: {
      launch_mode: profile.launch_mode
    }
  });

  const selectedMode = watch('launch_mode');

  const onSubmit = (data: LaunchModeFormData) => {
    next(data);
  };

  return (
    <StepTemplate
      title="What type of business are you launching?"
      description="We'll customize your starting experience based on your business type"
      showBack
      showNext
      nextLabel="Continue"
      nextDisabled={!selectedMode}
      onNext={handleSubmit(onSubmit)}
      onBack={back}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {modes.map(({ value, label, icon: Icon, description }) => (
          <button
            key={value}
            type="button"
            onClick={() => setValue('launch_mode', value as LaunchMode, { shouldValidate: true })}
            className={`flex flex-col items-center p-6 rounded-lg border transition-all ${
              selectedMode === value 
                ? 'border-primary bg-primary/5 shadow-sm' 
                : 'border-border hover:border-primary/50'
            }`}
          >
            <Icon className={`h-8 w-8 mb-3 ${selectedMode === value ? 'text-primary' : 'text-muted-foreground'}`} />
            <h3 className="font-medium mb-2">{label}</h3>
            <p className="text-sm text-muted-foreground text-center">{description}</p>
          </button>
        ))}
      </div>
    </StepTemplate>
  );
}
