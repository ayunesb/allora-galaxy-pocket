
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Step1 from "./step1-company-details";
import Step2 from "./step2-industry-selection";
import Step3 from "./step3-goal-setting";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { getReferralByEmail, claimReferral } from "@/lib/referrals/referralUtils";

export default function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const next = () => setStep((s) => Math.min(s + 1, 3));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  useEffect(() => {
    const handleReferral = async () => {
      if (!user?.email) return;
      
      // Check if user was referred
      const { data: referral } = await getReferralByEmail(user.email);
      
      if (referral?.id && user.id) {
        await claimReferral(user.id, referral.id);
      }
    };

    handleReferral();
  }, [user]);

  // Save referral code to localStorage if present in URL
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      localStorage.setItem('referralCode', refCode);
    }
  }, [searchParams]);

  return (
    <Card className="w-full">
      {step === 1 && <Step1 onNext={next} />}
      {step === 2 && <Step2 onNext={next} onBack={back} />}
      {step === 3 && <Step3 onBack={back} />}
    </Card>
  );
}
