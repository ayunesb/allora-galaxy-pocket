
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { useTenant } from '@/hooks/useTenant';
import { useSystemLogs } from '@/hooks/useSystemLogs';
import { ToastService } from '@/services/ToastService';
import { Campaign } from '@/types/campaign';
import { supabase } from '@/integrations/supabase/client';

interface CampaignWizardProps {
  strategy?: { id: string; title: string; };
  defaultName?: string;
}

export default function CampaignWizard({ strategy, defaultName = '' }: CampaignWizardProps) {
  const [currentStep, setCurrentStep] = useState('basics');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      name: defaultName,
      description: '',
    }
  });
  const { tenant } = useTenant();
  const { logActivity } = useSystemLogs();
  const navigate = useNavigate();

  // Get form values
  const name = watch('name');
  const description = watch('description');

  const goToStep = (step: string) => {
    if (step === 'channels' && !name) {
      ToastService.error("Please enter a campaign name first");
      return;
    }
    setCurrentStep(step);
  };

  const handleSave = async (formData: any) => {
    if (!tenant?.id) {
      ToastService.error("No tenant selected");
      return;
    }

    setIsSubmitting(true);

    try {
      const campaign: Partial<Campaign> = {
        name: formData.name,
        description: formData.description,
        tenant_id: tenant.id,
        status: 'draft',
        strategy_id: strategy?.id,
      };

      const { data, error } = await supabase
        .from('campaigns')
        .insert(campaign)
        .select('id')
        .single();

      if (error) throw error;

      // Log the activity
      await logActivity(
        'CAMPAIGN_CREATED',
        `Campaign "${campaign.name}" created`,
        {
          campaignId: data.id,
          strategyId: strategy?.id
        }
      );

      ToastService.success({
        title: "Campaign created",
        description: "Your campaign has been saved as a draft"
      });

      // Navigate to the campaign details page
      navigate(`/campaigns/${data.id}`);
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      ToastService.error({
        title: "Failed to create campaign",
        description: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    ToastService.info({
      title: "Campaign creation cancelled",
      description: "Your changes have been discarded"
    });
    navigate('/campaigns');
  };

  return (
    <form onSubmit={handleSubmit(handleSave)}>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-xl">Create New Campaign</CardTitle>
          <CardDescription>
            {strategy ? `Based on strategy: ${strategy.title}` : 'Create a new marketing campaign'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={currentStep} onValueChange={goToStep} className="space-y-6">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="basics">1. Basics</TabsTrigger>
              <TabsTrigger value="channels" disabled={!name}>2. Channels</TabsTrigger>
              <TabsTrigger value="review" disabled={!name}>3. Review</TabsTrigger>
            </TabsList>

            <TabsContent value="basics" className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium">
                  Campaign Name
                </label>
                <Input
                  id="name"
                  {...register('name', { required: 'Campaign name is required' })}
                  placeholder="Enter campaign name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message as string}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-medium">
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  {...register('description')}
                  className="w-full p-2 border rounded-md min-h-[100px]"
                  placeholder="Enter campaign description"
                />
              </div>
            </TabsContent>

            <TabsContent value="channels" className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium text-lg mb-2">Available Channels</h3>
                <p className="text-muted-foreground mb-4">
                  Select the channels that will be used in this campaign.
                </p>
                <p className="text-sm text-muted-foreground">
                  Channel selection will be implemented in the next phase.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="review" className="space-y-4">
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Campaign Summary</h3>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Name:</span> {name}
                    </p>
                    <p>
                      <span className="font-medium">Description:</span>{' '}
                      {description || 'No description provided'}
                    </p>
                    <p>
                      <span className="font-medium">Based on Strategy:</span>{' '}
                      {strategy ? strategy.title : 'None'}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Selected Channels</h3>
                  <p className="text-sm text-muted-foreground">
                    No channels selected yet.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
          >
            Cancel
          </Button>

          <div className="space-x-2">
            {currentStep === 'basics' ? (
              <Button
                type="button"
                onClick={() => goToStep('channels')}
                disabled={!name}
              >
                Next: Channels
              </Button>
            ) : currentStep === 'channels' ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => goToStep('basics')}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={() => goToStep('review')}
                >
                  Next: Review
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => goToStep('channels')}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Campaign'}
                </Button>
              </>
            )}
          </div>
        </CardFooter>
      </Card>
    </form>
  );
}
