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
      const { data, error } = await supabase
        .from('user_personas')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        // Fallback to local storage if Supabase fetch fails
        return localPersona;
      }

      return data as PersonaPreferences;
    }
  });

  const { mutate: updatePersona } = useMutation({
    mutationFn: async (updates: Partial<PersonaPreferences>) => {
      const updatedPersona = {
        ...persona,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      // Update Supabase
      const { error } = await supabase
        .from('user_personas')
        .upsert({
          user_id: userId,
          ...updatedPersona
        });

      if (error) throw error;

      // Update local storage as backup
      localStorage.setItem(`persona-${userId}`, JSON.stringify(updatedPersona));

      return updatedPersona;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['persona', userId] });
    }
  });

  // Keep local storage in sync with Supabase data
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
