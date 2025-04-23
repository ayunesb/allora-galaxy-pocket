
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { CMO_Agent } from '@/lib/agents/CMO_Agent';

// Form schema for campaign creation
const campaignFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  product: z.string().min(2, "Product must be at least 2 characters"),
  audience: z.string().min(2, "Audience must be at least 2 characters"),
});

type CampaignFormValues = z.infer<typeof campaignFormSchema>;

export function CampaignWizard() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { tenant } = useTenant();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [generatedContent, setGeneratedContent] = useState<{ 
    channel: string; 
    message: string; 
    offer: string;
  } | null>(null);
  
  const prefillData = searchParams.get('prefill');

  // Initialize form with default values or prefill data
  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      name: "",
      description: "",
      product: "",
      audience: "",
    },
  });

  // Load prefill data from URL if available
  useEffect(() => {
    if (prefillData) {
      try {
        const data = JSON.parse(decodeURIComponent(prefillData));
        form.reset({
          name: data.name || "",
          description: data.description || "",
          product: data.product || "",
          audience: data.audience || "",
        });
        
        // Handle insight_id for later linking
        if (data.insight_id) {
          // Store for later use when campaign is launched
          sessionStorage.setItem('campaign_insight_id', data.insight_id);
        }
      } catch (error) {
        console.error("Error parsing prefill data:", error);
        toast({
          title: "Error",
          description: "Could not load prefilled data",
          variant: "destructive"
        });
      }
    }
  }, [prefillData, form, toast]);

  // Generate campaign content using AI
  const generateCampaignContent = async (values: CampaignFormValues) => {
    setIsLoading(true);
    try {
      const result = await CMO_Agent.run({
        product: values.product,
        audience: values.audience
      });
      
      setGeneratedContent(result);
      setStep(2);
    } catch (error) {
      console.error("Error generating campaign:", error);
      toast({
        title: "Generation failed",
        description: "Could not generate campaign content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Save campaign to database and link with insight if needed
  const saveCampaign = async (values: CampaignFormValues) => {
    if (!tenant?.id) {
      toast({
        title: "Error",
        description: "No tenant found. Please try again.",
        variant: "destructive"
      });
      return null;
    }

    setIsLoading(true);
    try {
      // Prepare campaign data with generated content
      const campaignData = {
        name: values.name,
        description: values.description,
        tenant_id: tenant.id,
        status: "active",
        scripts: {
          product: values.product,
          audience: values.audience,
          channel: generatedContent?.channel || "",
          message: generatedContent?.message || "",
          offer: generatedContent?.offer || ""
        }
      };
      
      // Save to database
      const { data: campaign, error } = await supabase
        .from('campaigns')
        .insert(campaignData)
        .select()
        .single();
        
      if (error) throw error;
      
      // Link insight if available
      const insightId = sessionStorage.getItem('campaign_insight_id');
      if (insightId && campaign) {
        await supabase
          .from('kpi_insights')
          .update({ 
            campaign_id: campaign.id,
            outcome: 'pending'
          })
          .eq('id', insightId);
          
        // Clear from session storage
        sessionStorage.removeItem('campaign_insight_id');
      }
      
      return campaign;
    } catch (error) {
      console.error("Error saving campaign:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const onSubmit = async (values: CampaignFormValues) => {
    if (step === 1) {
      await generateCampaignContent(values);
    } else {
      try {
        const campaign = await saveCampaign(values);
        if (campaign) {
          toast({
            title: "Campaign created",
            description: "Your campaign has been created successfully",
          });
          navigate(`/campaigns/${campaign.id}`);
        }
      } catch (error: any) {
        toast({
          title: "Error saving campaign",
          description: error.message || "Could not save campaign",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="container max-w-3xl mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {step === 1 ? "Create Campaign" : "Review Campaign"}
        </h1>
        <div className="flex items-center gap-2">
          <div className={`h-2 w-8 rounded-full ${step >= 1 ? "bg-primary" : "bg-gray-200"}`}></div>
          <div className={`h-2 w-8 rounded-full ${step >= 2 ? "bg-primary" : "bg-gray-200"}`}></div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{step === 1 ? "Campaign Details" : "Generated Campaign"}</CardTitle>
          <CardDescription>
            {step === 1 
              ? "Enter details about your campaign to get AI-powered suggestions." 
              : "Review the AI-generated content and make any necessary adjustments."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {step === 1 ? (
                <>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Campaign Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Summer Sale 2025" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Campaign Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Brief description of what this campaign aims to achieve"
                            className="min-h-24"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="product"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product/Service</FormLabel>
                          <FormControl>
                            <Input placeholder="What are you promoting?" {...field} />
                          </FormControl>
                          <FormDescription>
                            The product or service this campaign promotes
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="audience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Audience</FormLabel>
                          <FormControl>
                            <Input placeholder="Who are you targeting?" {...field} />
                          </FormControl>
                          <FormDescription>
                            Describe your ideal customer for this campaign
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              ) : (
                generatedContent && (
                  <div className="space-y-6">
                    <div className="rounded-md border p-4">
                      <h3 className="font-medium mb-2">Campaign Message</h3>
                      <div className="whitespace-pre-wrap text-sm text-muted-foreground">
                        {generatedContent.message}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="rounded-md border p-4">
                        <h3 className="font-medium mb-2">Channel Strategy</h3>
                        <p className="text-sm text-muted-foreground">{generatedContent.channel}</p>
                      </div>
                      
                      <div className="rounded-md border p-4">
                        <h3 className="font-medium mb-2">Offer Structure</h3>
                        <p className="text-sm text-muted-foreground">{generatedContent.offer}</p>
                      </div>
                    </div>
                    
                    {/* Hidden fields to preserve form data */}
                    <input type="hidden" {...form.register("name")} />
                    <input type="hidden" {...form.register("description")} />
                    <input type="hidden" {...form.register("product")} />
                    <input type="hidden" {...form.register("audience")} />
                  </div>
                )
              )}
              
              <div className="flex justify-between pt-4">
                {step === 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isLoading}
                    onClick={() => setStep(1)}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                )}
                
                {step === 1 && (
                  <div className="ml-auto">
                    <Button 
                      type="submit"
                      disabled={isLoading || !form.formState.isValid}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          Generate Campaign
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                )}
                
                {step === 2 && (
                  <Button 
                    type="submit"
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Launch Campaign
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
