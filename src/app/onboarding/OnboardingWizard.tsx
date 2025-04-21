
import React, { useState } from "react";
import Step1 from "./step1-company-details";
import Step2 from "./step2-industry-selection";
import Step3 from "./step3-goal-setting";
import { Card } from "@/components/ui/card";

export default function OnboardingWizard() {
  const [step, setStep] = useState(1);
  
  const next = () => setStep((s) => Math.min(s + 1, 3));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <Card className="w-full">
      {step === 1 && <Step1 onNext={next} />}
      {step === 2 && <Step2 onNext={next} onBack={back} />}
      {step === 3 && <Step3 onBack={back} />}
    </Card>
  );
}
