
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { OnboardingProfile } from "@/types/onboarding";
import StepTemplate from "./StepTemplate";

type Props = {
  next: (data: Partial<OnboardingProfile>) => void;
  back: () => void;
  profile: OnboardingProfile;
};

export default function StepChallenges({ next, back, profile }: Props) {
  const [challenges, setChallenges] = React.useState<string[]>(profile.challenges || []);
  const [currentChallenge, setCurrentChallenge] = React.useState("");

  const addChallenge = () => {
    if (currentChallenge.trim()) {
      setChallenges([...challenges, currentChallenge.trim()]);
      setCurrentChallenge("");
    }
  };

  const handleNext = () => {
    if (challenges.length > 0) {
      next({ challenges });
    }
  };

  return (
    <StepTemplate
      title="What challenges is your business facing?"
      description="Add the key challenges you want to overcome"
      showBack
      onBack={back}
      onNext={handleNext}
      nextDisabled={challenges.length === 0}
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={currentChallenge}
            onChange={(e) => setCurrentChallenge(e.target.value)}
            placeholder="Enter a challenge"
            onKeyDown={(e) => e.key === 'Enter' && addChallenge()}
          />
          <button
            type="button"
            className="bg-primary text-white px-4 py-2 rounded"
            onClick={addChallenge}
          >
            Add
          </button>
        </div>

        <div className="space-y-2">
          {challenges.map((challenge, index) => (
            <div key={index} className="p-2 bg-secondary rounded-md">
              {challenge}
            </div>
          ))}
        </div>
      </div>
    </StepTemplate>
  );
}
