import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTenant } from '@/hooks/useTenant';
import { useAuth } from '@/hooks/useAuth';
import { useSystemLogs } from '@/hooks/useSystemLogs';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export default function CampaignCreatePage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'email',
    goal: '',
    target_audience: '',
    budget: '',
    duration: '30',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { tenant } = useTenant();
  const { user } = useAuth();
  const { logActivity } = useSystemLogs();
  const navigate = useNavigate();

  useEffect(() => {
    // Log page view
    if (tenant?.id) {
      logActivity(
        'CAMPAIGN_CREATE_VIEW',
        'Campaign creation page viewed',
        { tenant_id: tenant.id }
      );
    }
  }, [tenant?.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tenant?.id || !user?.id) {
      toast.error('Authentication error', {
        description: 'Please ensure you are logged in and have selected a workspace'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Log the start of campaign creation
      await logActivity(
        'CAMPAIGN_CREATE_START',
        'Campaign creation started',
        { 
          campaign_name: formData.name,
          campaign_type: formData.type
        }
      );
      
      // Create the campaign in the database
      const { data, error } = await supabase
        .from('campaigns')
        .insert({
          tenant_id: tenant.id,
          created_by: user.id,
          name: formData.name,
          description: formData.description,
          type: formData.type,
          goal: formData.goal,
          target_audience: formData.target_audience,
          budget: formData.budget ? parseFloat(formData.budget) : null,
          duration_days: parseInt(formData.duration),
          status: 'draft'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Log successful campaign creation
      await logActivity(
        'CAMPAIGN_CREATED',
        'New campaign created successfully',
        {
          campaign_id: data.id,
          campaign_name: data.name,
          campaign_type: data.type
        }
      );
      
      toast.success('Campaign created', {
        description: 'Your campaign has been created successfully'
      });
      
      // Navigate to the campaign details page
      navigate(`/campaigns/${data.id}`);
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      
      // Log the error
      await logActivity(
        'CAMPAIGN_CREATE_ERROR',
        'Campaign creation failed',
        {
          error: error.message,
          form_data: formData
        },
        'error'
      );
      
      toast.error('Failed to create campaign', {
        description: error.message || 'An unexpected error occurred'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Create New Campaign</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Campaign Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter campaign name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your campaign"
                rows={4}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="type">Campaign Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleSelectChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select campaign type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="social">Social Media</SelectItem>
                    <SelectItem value="content">Content Marketing</SelectItem>
                    <SelectItem value="ppc">Pay-per-Click</SelectItem>
                    <SelectItem value="seo">SEO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="goal">Campaign Goal</Label>
                <Input
                  id="goal"
                  name="goal"
                  value={formData.goal}
                  onChange={handleChange}
                  placeholder="e.g., Increase website traffic by 20%"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="target_audience">Target Audience</Label>
              <Input
                id="target_audience"
                name="target_audience"
                value={formData.target_audience}
                onChange={handleChange}
                placeholder="Describe your target audience"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="budget">Budget (USD)</Label>
                <Input
                  id="budget"
                  name="budget"
                  type="number"
                  value={formData.budget}
                  onChange={handleChange}
                  placeholder="Enter budget amount"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (Days)</Label>
                <Select
                  value={formData.duration}
                  onValueChange={(value) => handleSelectChange('duration', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="60">60 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/campaigns')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Campaign'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
