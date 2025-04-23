import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { useAuth } from "@/hooks/useAuth";

export function usePromptVersioning(agentName: string) {
  const { tenant } = useTenant();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch prompt versions (history)
  const { data: versions = [], isLoading } = useQuery({
    queryKey: ["prompt-versions", agentName, tenant?.id],
    enabled: !!agentName && !!tenant?.id,
    queryFn: async () => {
      if (!tenant?.id) return [];
      const { data, error } = await supabase
        .from("agent_prompt_versions")
        .select("*")
        .eq("agent_name", agentName)
        .eq("tenant_id", tenant.id)
        .order("version", { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // Add a new mutation to generate an explanation for the prompt
  const { mutateAsync: generatePromptExplanation } = useMutation({
    mutationFn: async ({ prompt, versionId }: { prompt: string; versionId: string }) => {
      // Check if OpenAI is configured
      const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
      if (!openAIApiKey) {
        console.warn('OpenAI API key not configured');
        return null;
      }

      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{
              role: 'user',
              content: `Explain this agent prompt as if you're the agent's product manager. Discuss its purpose, strategy, and expected outcomes.\n\nPrompt:\n${prompt}`
            }],
          }),
        });

        const data = await response.json();
        const explanation = data.choices[0].message.content;

        // Update the prompt version with the explanation
        await supabase
          .from('agent_prompt_versions')
          .update({ explanation })
          .eq('id', versionId);

        return explanation;
      } catch (error) {
        console.error('Error generating prompt explanation:', error);
        return null;
      }
    }
  });

  // Existing savePromptVersion mutation updated to generate explanation
  const { mutateAsync: savePromptVersion, isPending: isSaving } = useMutation({
    mutationFn: async ({ prompt }: { prompt: string }) => {
      if (!tenant?.id || !user?.id) throw new Error("Missing tenant or user id");
      
      // Get latest version
      const { data: latest, error: vError } = await supabase
        .from("agent_prompt_versions")
        .select("version")
        .eq("agent_name", agentName)
        .eq("tenant_id", tenant.id)
        .order("version", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (vError) throw vError;
      const newVersion = (latest?.version || 0) + 1;

      // Insert new version
      const { data: insertedVersion, error: insertErr } = await supabase
        .from("agent_prompt_versions")
        .insert({
          agent_name: agentName,
          prompt,
          version: newVersion,
          edited_by: user.id,
          tenant_id: tenant.id,
        })
        .select('id')
        .single();
      
      if (insertErr) throw insertErr;

      // Generate explanation for the new version
      await generatePromptExplanation({ 
        prompt, 
        versionId: insertedVersion.id 
      });

      // Update blueprint prompt
      const { error: updateErr } = await supabase
        .from("agent_blueprints")
        .update({ prompt })
        .eq("agent_name", agentName);
      
      if (updateErr) throw updateErr;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["prompt-versions", agentName, tenant?.id] })
  });

  return {
    versions,
    isLoading,
    savePromptVersion,
    restorePromptVersion,
    isSaving,
    generatePromptExplanation
  };
}
