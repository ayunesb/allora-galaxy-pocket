import { useState } from "react";
import { Button } from "@/components/ui/button";
import StepIndustry from "./StepIndustry";
import StepGoal from "./StepGoal";
import StrategyResult from "./StrategyResult";
import { useToast } from "@/hooks/use-toast";

export default function StrategyWizard() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [industry, setIndustry] = useState("");
  const [goal, setGoal] = useState("");

  const handleLaunchStrategy = () => {
    toast({
      title: "Strategy launched",
      description: "Your AI-powered strategy is now being generated",
    });
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 p-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Strategy Generator</h1>
        <p className="text-muted-foreground">
          Create an AI-powered strategy in minutes
        </p>
      </div>

      <div className="space-y-6">
        {step === 1 && <StepIndustry value={industry} onChange={setIndustry} />}
        {step === 2 && <StepGoal value={goal} onChange={setGoal} />}
        {step === 3 && <StrategyResult industry={industry} goal={goal} />}
        
        <div className="flex justify-between pt-4">
          {step > 1 && (
            <Button 
              variant="outline"
              onClick={() => setStep(step - 1)}
            >
              ← Back
            </Button>
          )}
          {step === 1 && <div />}
          {step < 3 && (
            <Button 
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && !industry || step === 2 && !goal}
            >
              Next →
            </Button>
          )}
          {step === 3 && (
            <Button 
              variant="default" 
              className="bg-green-600 hover:bg-green-700"
              onClick={handleLaunchStrategy}
            >
              Launch Strategy
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
