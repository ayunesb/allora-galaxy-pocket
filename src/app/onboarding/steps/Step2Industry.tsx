
// Import React and necessary hooks and components
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StepTemplate } from '../components/StepTemplate';
import { useTenant } from '@/hooks/useTenant';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Define industry options
const industryOptions = [
  'Technology',
  'Finance',
  'Healthcare',
  'Education',
  'Retail',
  'Manufacturing',
  'Media',
  'Entertainment',
  'Travel',
  'Food & Beverage',
  'Other'
];

export default function Step2Industry({ onNext }: { onNext: () => void }) {
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [otherIndustry, setOtherIndustry] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const { tenant, refreshTenant } = useTenant();

  const handleNext = async () => {
    if (!tenant) {
      toast.error('No tenant selected');
      return;
    }

    setProcessing(true);
    
    try {
      // Update the company profile with the industry
      const finalIndustry = selectedIndustry === 'Other' ? otherIndustry : selectedIndustry;
      
      const { error } = await supabase
        .from('company_profiles')
        .update({ industry: finalIndustry })
        .eq('tenant_id', tenant.id);
      
      if (error) throw error;
      
      await refreshTenant();
      onNext();
    } catch (err: any) {
      toast.error('Failed to save industry', {
        description: err.message
      });
    } finally {
      setProcessing(false);
    }
  };
  
  return (
    <StepTemplate 
      title="Select Your Industry" 
      description="This helps us customize your experience."
      showBack={true}
      onBack={() => window.history.back()}
      onNext={handleNext}
      nextDisabled={!selectedIndustry || (selectedIndustry === 'Other' && !otherIndustry)}
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {industryOptions.map((industry) => (
          <Card 
            key={industry}
            className={`cursor-pointer transition-all hover:border-primary ${
              selectedIndustry === industry ? 'border-2 border-primary bg-primary/5' : ''
            }`}
            onClick={() => setSelectedIndustry(industry)}
          >
            <CardContent className="p-4 flex items-center justify-center text-center min-h-[70px]">
              {industry}
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedIndustry === 'Other' && (
        <div className="mt-4">
          <Input 
            value={otherIndustry}
            onChange={(e) => setOtherIndustry(e.target.value)} 
            placeholder="Please specify your industry"
          />
        </div>
      )}

      <div className="mt-8 text-center">
        <Button 
          onClick={handleNext} 
          disabled={!selectedIndustry || (selectedIndustry === 'Other' && !otherIndustry) || processing}
        >
          {processing ? 'Saving...' : 'Continue'}
        </Button>
      </div>
    </StepTemplate>
  );
}
