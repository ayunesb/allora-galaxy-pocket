
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

export default function Step3Goals({ next, back, profile }: Props) {
  const [goals, setGoals] = React.useState<string[]>(profile.goals || []);
  const [currentGoal, setCurrentGoal] = React.useState("");

  const addGoal = () => {
    if (currentGoal.trim()) {
      setGoals([...goals, currentGoal.trim()]);
      setCurrentGoal("");
    }
  };

  const handleNext = () => {
    if (goals.length > 0) {
      next({ goals });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">What are your main business goals?</h2>
        <p className="text-sm text-muted-foreground">Add your key business objectives</p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={currentGoal}
            onChange={(e) => setCurrentGoal(e.target.value)}
            placeholder="Enter a goal"
            onKeyDown={(e) => e.key === 'Enter' && addGoal()}
          />
          <Button onClick={addGoal}>Add</Button>
        </div>

        <div className="space-y-2">
          {goals.map((goal, index) => (
            <div key={index} className="p-2 bg-secondary rounded-md">
              {goal}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={back}>Back</Button>
        <Button onClick={handleNext} disabled={goals.length === 0}>Next</Button>
      </div>
    </div>
  );
}
