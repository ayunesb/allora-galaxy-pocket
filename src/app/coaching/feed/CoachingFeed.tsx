
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { scoreSuggestions } from "./scoreSuggestions";
import { useTenant } from "@/hooks/useTenant";

const suggestions = [
  {
    title: "Activate Users in First 5 Min",
    description: "Add a welcome checklist and reward first 3 actions to boost activation by 27%.",
    impact: "Activation +27%"
  },
  {
    title: "Cut CAC with Warm Retargeting",
    description: "Use recent clicks to build Meta Custom Audiences and deploy reminder offer.",
    impact: "CAC -15%"
  },
  {
    title: "Increase Trial Conversion by 12%",
    description: "Insert urgent CTA at day 6 with AI-generated discount logic.",
    impact: "Conversion +12%"
  }
];

export default function CoachingFeed() {
  const [feedbackLogs, setFeedbackLogs] = useState<any[]>([]);
  const [rankedSuggestions, setRankedSuggestions] = useState(suggestions);
  const { toast } = useToast();
  const { user } = useAuth();
  const { tenant } = useTenant();

  useEffect(() => {
    async function fetchFeedback() {
      const { data } = await supabase
        .from('strategy_feedback')
        .select('strategy_title, action')
        .eq('tenant_id', tenant?.id);
        
      if (data) {
        setFeedbackLogs(data);
        const ranked = scoreSuggestions(suggestions, data);
        setRankedSuggestions(ranked);
      }
    }
    
    fetchFeedback();
  }, [tenant?.id]);

  const handleUseSuggestion = async (index: number) => {
    const suggestion = rankedSuggestions[index];

    const { data, error } = await supabase
      .from('vault_strategies')
      .insert({
        title: suggestion.title,
        description: suggestion.description,
        tenant_id: tenant?.id
      });

    await supabase
      .from('strategy_feedback')
      .insert({
        strategy_title: suggestion.title,
        action: 'used',
        tenant_id: tenant?.id
      });

    if (error) {
      toast({
        title: "Error saving strategy",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Strategy saved",
        description: "The strategy has been added to your vault",
      });
    }
  };

  const handleDismissSuggestion = async (index: number) => {
    const suggestion = rankedSuggestions[index];
    
    await supabase
      .from('strategy_feedback')
      .insert({
        strategy_title: suggestion.title,
        action: 'dismissed',
        tenant_id: tenant?.id
      });
    
    const updatedSuggestions = rankedSuggestions.filter((_, i) => i !== index);
    setRankedSuggestions(updatedSuggestions);
  };

  return (
    <div className="p-6 space-y-6 bg-background dark:bg-gray-900 rounded-lg">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground dark:text-white">🧠 AI Strategy Coach</h2>
      </div>
      {rankedSuggestions.length === 0 ? (
        <div className="text-center text-muted-foreground dark:text-gray-400 py-8">
          No new suggestions at the moment. Check back later!
        </div>
      ) : (
        rankedSuggestions.map((suggestion, index) => (
          <div 
            key={index} 
            className="bg-card dark:bg-gray-800/90 p-5 rounded-lg shadow-md space-y-3 border-l-4 border-primary"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-foreground dark:text-white">{suggestion.title}</h3>
                <p className="text-sm text-muted-foreground dark:text-gray-300 mt-1">{suggestion.description}</p>
                <span className="inline-block mt-2 text-xs bg-accent dark:bg-gray-700 text-accent-foreground dark:text-white px-2 py-1 rounded">
                  Impact: {suggestion.impact}
                </span>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/50"
                  onClick={() => handleUseSuggestion(index)}
                >
                  <Check className="mr-2 h-4 w-4" /> Use
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-gray-500 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50"
                  onClick={() => handleDismissSuggestion(index)}
                >
                  <X className="mr-2 h-4 w-4" /> Dismiss
                </Button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
