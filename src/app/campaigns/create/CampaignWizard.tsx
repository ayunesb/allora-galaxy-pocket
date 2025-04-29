'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { useTenant } from "@/hooks/useTenant";
import { useSystemLogs } from "@/hooks/useSystemLogs";
import { CampaignStatus } from "@/types/campaign";
import { supabase } from '@/integrations/supabase/client';

const campaignSchema = z.object({
  name: z.string().min(3, {
    message: "Campaign name must be at least 3 characters.",
  }),
  description: z.string().optional(),
  status: z.enum([CampaignStatus.ACTIVE, CampaignStatus.INACTIVE, CampaignStatus.DRAFT]),
  strategy_id: z.string().uuid().optional(),
  scripts: z.record(z.string(), z.any()).optional(),
  metrics: z.record(z.string(), z.any()).optional()
});

type CampaignValues = z.infer<typeof campaignSchema>;

export default function CampaignWizard() {
  const router = useRouter();
  const { tenant } = useTenant();
  const { logActivity } = useSystemLogs();
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CampaignValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      status: CampaignStatus.DRAFT,
    },
  });

  useEffect(() => {
    if (tenant?.id) {
      logActivity(
        'CAMPAIGN_CREATE_VIEW',
        'Campaign creation page accessed',
        { timestamp: new Date().toISOString() }
      );
    }
  }, [tenant?.id]);

  const onSubmit = async (data: CampaignValues) => {
    setSubmitting(true);
    
    try {
      // Ensure required fields are present
      if (!data.name || !data.status) {
        toast.error("Campaign name and status are required");
        setSubmitting(false);
        return;
      }
    
      // Create campaign with required fields
      const { data: campaignData, error } = await supabase
        .from('campaigns')
        .insert({
          name: data.name,
          description: data.description,
          status: data.status,
          tenant_id: tenant?.id,
          strategy_id: data.strategy_id,
          execution_status: 'pending',
          scripts: data.scripts || {},
          metrics: data.metrics || {}
        })
        .select()
        .single();

      if (error) {
        toast.error(`Failed to create campaign: ${error.message}`);
        console.error("Supabase error:", error);
        setSubmitting(false);
        return;
      }

      toast.success("Campaign created successfully!");
      router.push('/campaigns');
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create New Campaign</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Campaign Name</Label>
              <Controller
                control={control}
                name="name"
                render={({ field }) => (
                  <Input id="name" placeholder="My Awesome Campaign" {...field} />
                )}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Controller
                control={control}
                name="description"
                render={({ field }) => (
                  <Textarea id="description" placeholder="Details about the campaign" {...field} />
                )}
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={CampaignStatus.DRAFT}>{CampaignStatus.DRAFT}</SelectItem>
                      <SelectItem value={CampaignStatus.ACTIVE}>{CampaignStatus.ACTIVE}</SelectItem>
                      <SelectItem value={CampaignStatus.INACTIVE}>{CampaignStatus.INACTIVE}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && (
                <p className="text-sm text-red-500">{errors.status.message}</p>
              )}
            </div>

            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create Campaign"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
