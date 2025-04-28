
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AgentProfile } from "@/types/agent";

interface AgentProfileEditorProps {
  agent: AgentProfile | null;
}

export default function AgentProfileEditor({ agent }: AgentProfileEditorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      agent_name: agent?.agent_name || "",
      role: agent?.role || "",
      tone: agent?.tone || "",
      language: agent?.language || "English",
    }
  });

  const onSubmit = async (data: any) => {
    if (!agent?.id) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('agent_profiles')
        .update({
          agent_name: data.agent_name,
          role: data.role,
          tone: data.tone,
          language: data.language,
          updated_at: new Date().toISOString()
        })
        .eq('id', agent.id)
        .eq('tenant_id', agent.tenant_id);

      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: "The agent profile has been successfully updated."
      });
    } catch (error) {
      console.error('Error updating agent profile:', error);
      toast({
        title: "Update failed",
        description: "Failed to update agent profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!agent) {
    return <div>No agent profile selected</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Agent Name</label>
        <Input 
          {...register("agent_name", { required: "Name is required" })} 
          placeholder="e.g. CEO Agent" 
        />
        {errors.agent_name && (
          <p className="text-sm text-red-500">{errors.agent_name.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Role</label>
        <Input 
          {...register("role", { required: "Role is required" })} 
          placeholder="e.g. Strategic advisor" 
        />
        {errors.role && (
          <p className="text-sm text-red-500">{errors.role.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Tone</label>
        <Textarea 
          {...register("tone", { required: "Tone is required" })} 
          placeholder="e.g. Professional but friendly" 
          rows={2}
        />
        {errors.tone && (
          <p className="text-sm text-red-500">{errors.tone.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Language</label>
        <Input 
          {...register("language")} 
          placeholder="e.g. English" 
          defaultValue="English"
        />
      </div>
      
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Saving..." : "Update Profile"}
      </Button>
    </form>
  );
}
