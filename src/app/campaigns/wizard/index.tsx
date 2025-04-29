
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTenant } from '@/hooks/useTenant';
import { Progress } from '@/components/ui/progress';

export default function CampaignWizard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { tenant } = useTenant();
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Final step completed
      toast({
        title: "Campaign created!",
        description: "Your new campaign has been successfully created."
      });
      navigate('/campaigns');
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="container max-w-3xl mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold">Create Campaign: Step {step}/{totalSteps}</h1>
      
      <Progress value={(step / totalSteps) * 100} className="h-2" />
      
      <Card className="border shadow-md">
        <CardHeader>
          <CardTitle>{getStepTitle(step)}</CardTitle>
          <CardDescription>{getStepDescription(step)}</CardDescription>
        </CardHeader>
        
        <CardContent>
          {renderStepContent(step)}
        </CardContent>
        
        <CardFooter className="flex justify-between border-t pt-4">
          <Button 
            variant="outline" 
            onClick={prevStep}
            disabled={step === 1}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <Button onClick={nextStep}>
            {step === totalSteps ? (
              <>
                Complete
                <Sparkles className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function getStepTitle(step: number): string {
  switch(step) {
    case 1: return "Campaign Basics";
    case 2: return "Target Audience";
    case 3: return "Channel Selection";
    case 4: return "KPI Setup";
    default: return "";
  }
}

function getStepDescription(step: number): string {
  switch(step) {
    case 1: return "Define the fundamentals of your campaign";
    case 2: return "Define who you want to reach";
    case 3: return "Select the channels for your campaign";
    case 4: return "Set up metrics to track success";
    default: return "";
  }
}

function renderStepContent(step: number): React.ReactNode {
  switch(step) {
    case 1:
      return (
        <div className="space-y-4">
          <p>Campaign basics placeholder - would include form controls for name, description, etc.</p>
        </div>
      );
    case 2:
      return (
        <div className="space-y-4">
          <p>Target audience placeholder - would include audience selection options</p>
        </div>
      );
    case 3:
      return (
        <div className="space-y-4">
          <p>Channel selection placeholder - would include channel checkboxes</p>
        </div>
      );
    case 4:
      return (
        <div className="space-y-4">
          <p>KPI setup placeholder - would include KPI configuration</p>
        </div>
      );
    default:
      return null;
  }
}
