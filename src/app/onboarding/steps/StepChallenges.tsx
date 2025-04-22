
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { OnboardingProfile } from "@/types/onboarding";

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
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">What challenges is your business facing?</h2>
        <p className="text-sm text-muted-foreground">Add the key challenges you want to overcome</p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={currentChallenge}
            onChange={(e) => setCurrentChallenge(e.target.value)}
            placeholder="Enter a challenge"
            onKeyDown={(e) => e.key === 'Enter' && addChallenge()}
          />
          <Button onClick={addChallenge}>Add</Button>
        </div>

        <div className="space-y-2">
          {challenges.map((challenge, index) => (
            <div key={index} className="p-2 bg-secondary rounded-md">
              {challenge}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={back}>Back</Button>
        <Button onClick={handleNext} disabled={challenges.length === 0}>Next</Button>
      </div>
    </div>
  );
}
