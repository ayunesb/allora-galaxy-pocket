
import React from 'react';
import OnboardingWizard from './OnboardingWizard';
import OnboardingLayout from './OnboardingLayout';

const OnboardingPage: React.FC = () => {
  console.log('Rendering OnboardingPage');
  return (
    <OnboardingLayout>
      <OnboardingWizard />
    </OnboardingLayout>
  );
};

export default OnboardingPage;
