import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useOnboardingSubmission } from './hooks/useOnboardingSubmission';

export default function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    companySize: '',
    goals: [],
    painPoints: []
  });
  
  // Use handleSubmit instead of completeOnboarding
  const { handleSubmit, isSubmitting } = useOnboardingSubmission();
  
  const nextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };
  
  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };
  
  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleFormSubmit = async () => {
    // Use handleSubmit from the hook
    await handleSubmit(formData);
  };
  
  // Render different steps based on currentStep
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-medium">Step 1: Company Details</h2>
            {/* Step 1 form fields would go here */}
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-medium">Step 2: Industry & Goals</h2>
            {/* Step 2 form fields would go here */}
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-medium">Step 3: Review & Submit</h2>
            <div className="p-4 border rounded">
              {/* Summary of collected data would go here */}
            </div>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Onboarding Wizard</CardTitle>
        </CardHeader>
        <CardContent>
          {renderStep()}
        </CardContent>
        <CardFooter className="flex justify-between">
          {currentStep > 1 && (
            <Button type="button" variant="outline" onClick={prevStep}>
              Back
            </Button>
          )}
          
          {currentStep < 3 ? (
            <Button type="button" onClick={nextStep}>
              Next
            </Button>
          ) : (
            <Button 
              type="button" 
              onClick={handleFormSubmit} 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Complete Onboarding'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
