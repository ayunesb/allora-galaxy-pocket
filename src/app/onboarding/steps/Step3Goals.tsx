
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
    <StepTemplate
      title="What are your main business goals?"
      description="Add your key business objectives"
      showBack
      onBack={back}
      onNext={handleNext}
      nextDisabled={goals.length === 0}
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={currentGoal}
            onChange={(e) => setCurrentGoal(e.target.value)}
            placeholder="Enter a goal"
            onKeyDown={(e) => e.key === 'Enter' && addGoal()}
          />
          <button
            type="button"
            className="bg-primary text-white px-4 py-2 rounded"
            onClick={addGoal}
          >
            Add
          </button>
        </div>

        <div className="space-y-2">
          {goals.map((goal, index) => (
            <div key={index} className="p-2 bg-secondary rounded-md">
              {goal}
            </div>
          ))}
        </div>
      </div>
    </StepTemplate>
  );
}
