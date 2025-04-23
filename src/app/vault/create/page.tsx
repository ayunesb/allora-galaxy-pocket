
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Rocket } from "lucide-react";

interface VaultStrategyForm {
  title: string;
  description: string;
  tags: string[];
  goal: string;
}

export default function VaultStrategyCreator() {
  const navigate = useNavigate();
  const searchParams = useSearchParams()[0];
  const memoryId = searchParams.get("from_memory");
  const [tags, setTags] = useState<string[]>([]);
  
  const form = useForm<VaultStrategyForm>({
    defaultValues: {
      title: "",
      description: "",
      tags: [],
      goal: ""
    }
  });

  useEffect(() => {
    if (memoryId) {
      loadMemoryData();
    }
  }, [memoryId]);

  const loadMemoryData = async () => {
    const { data: memory, error } = await supabase
      .from("agent_memory")
      .select("*")
      .eq("id", memoryId)
      .maybeSingle();

    if (error) {
      toast.error("Failed to load memory data");
      return;
    }

    if (memory) {
      form.reset({
        title: `Remixed from ${memory.agent_name} Memory`,
        description: memory.summary,
        tags: memory.tags || [],
        goal: ""
      });
      setTags(memory.tags || []);
    }
  };

  const onSubmit = async (data: VaultStrategyForm) => {
    const { error } = await supabase
      .from("vault_strategies")
      .insert({
        title: data.title,
        description: data.description,
        tags: tags,
        goal: data.goal,
        status: "draft",
        tenant_id: localStorage.getItem("currentTenantId")
      });

    // If strategy was remixed from a memory, increment remix count
    if (memoryId) {
      await supabase.rpc('increment_remix_count', { memory_id: memoryId });
    }

    if (error) {
      toast.error("Failed to save strategy");
      return;
    }

    toast.success("Strategy saved to vault");
    navigate("/vault");
  };

  const submitToAcademy = async () => {
    const formData = form.getValues();
    
    const { data, error } = await supabase.from('agent_memory').insert({
      agent_name: 'UserContributor',
      tenant_id: localStorage.getItem("currentTenantId"),
      summary: formData.description.slice(0, 280),
      tags: tags,
      is_user_submitted: true
    });

    if (error) {
      toast.error("Failed to submit to Academy");
      return;
    }

    toast.success('Submitted to Academy!');
  };

  return (
    <div className="container mx-auto py-8">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Create Strategy</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Strategy Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter strategy title" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Strategy Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Describe your strategy"
                        rows={6}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="goal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Objective / Goal</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter strategy goal" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div>
                <FormLabel>Tags</FormLabel>
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge 
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => setTags(tags.filter(t => t !== tag))}
                    >
                      {tag}
                      <span className="ml-1">×</span>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Save Strategy
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={submitToAcademy}
                >
                  🎓 Submit to Academy
                </Button>
                <Button type="button" variant="outline">
                  <Rocket className="mr-2 h-4 w-4" />
                  Launch as Campaign
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
