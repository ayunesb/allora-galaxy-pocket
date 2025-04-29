import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PersonaPreferences } from "@/types/persona";

export function usePersona(userId: string) {
  const queryClient = useQueryClient();
  const [localPersona, setLocalPersona] = useState<PersonaPreferences>(() => {
    const saved = localStorage.getItem(`persona-${userId}`);
    return saved ? JSON.parse(saved) : {
      industry: "",
      goal: "",
      tone: "inspirational",
    };
  });

  const { data: persona, isLoading } = useQuery({
    queryKey: ['persona', userId],
    queryFn: async (): Promise<PersonaPreferences> => {
      // Instead of querying a non-existent user_personas table,
      // we'll use profiles table or simply use localStorage data
      try {
        // Try to get from profiles if it has persona fields
        const { data, error } = await supabase
          .from('profiles')
          .select('industry, avatar_url')
          .eq('id', userId)
          .single();

        if (error) throw error;

        // Combine with local storage data for other fields
        return {
          ...localPersona,
          industry: data.industry || localPersona.industry,
          // Use other fields from local storage
        } as unknown as PersonaPreferences;
      } catch (err) {
        // Fallback to local storage if Supabase fetch fails
        return localPersona;
      }
    }
  });

  const { mutate: updatePersona } = useMutation({
    mutationFn: async (updates: Partial<PersonaPreferences>) => {
      const updatedPersona = {
        ...persona,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      // Store in localStorage as our primary storage
      localStorage.setItem(`persona-${userId}`, JSON.stringify(updatedPersona));

      // Try to update profile if it makes sense
      if (updates.industry) {
        try {
          await supabase
            .from('profiles')
            .update({ industry: updates.industry })
            .eq('id', userId);
        } catch (error) {
          console.error("Failed to update profile:", error);
          // Non-critical error, continue
        }
      }

      return updatedPersona;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['persona', userId] });
    }
  });

  // Keep local storage in sync with data
  useEffect(() => {
    if (persona) {
      localStorage.setItem(`persona-${userId}`, JSON.stringify(persona));
    }
  }, [persona, userId]);

  return {
    persona: persona || localPersona,
    updatePersona,
    isLoading
  };
}
