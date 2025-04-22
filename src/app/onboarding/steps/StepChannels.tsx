
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { Channel, OnboardingProfile } from "@/types/onboarding";
import StepTemplate from "./StepTemplate";

type Props = {
  next: (data: Partial<OnboardingProfile>) => void;
  back: () => void;
  profile: OnboardingProfile;
};

export default function StepChannels({ next, back, profile }: Props) {
  const [selected, setSelected] = React.useState<Channel[]>(profile.channels || []);

  const channels = [
    { value: 'email' as Channel, label: 'Email Marketing' },
    { value: 'whatsapp' as Channel, label: 'WhatsApp Business' },
    { value: 'instagram' as Channel, label: 'Instagram' },
    { value: 'linkedin' as Channel, label: 'LinkedIn' },
    { value: 'twitter' as Channel, label: 'Twitter' },
    { value: 'tiktok' as Channel, label: 'TikTok' }
  ];

  const toggleChannel = (value: Channel) => {
    setSelected(current => 
      current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value]
    );
  };

  const handleNext = () => {
    if (selected.length > 0) {
      next({ channels: selected });
    }
  };

  return (
    <StepTemplate
      title="Which marketing channels do you use?"
      description="Select all that apply"
      showBack
      onBack={back}
      onNext={handleNext}
      nextDisabled={selected.length === 0}
    >
      <div className="grid grid-cols-2 gap-4">
        {channels.map((channel) => (
          <div key={channel.value} className="flex items-center space-x-2">
            <Checkbox 
              id={channel.value}
              checked={selected.includes(channel.value)}
              onCheckedChange={() => toggleChannel(channel.value)}
            />
            <Label htmlFor={channel.value}>{channel.label}</Label>
          </div>
        ))}
      </div>
    </StepTemplate>
  );
}
