
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { scoreSuggestions } from "./scoreSuggestions";
import { useTenant } from "@/hooks/useTenant";
import { ScriptDialog } from "@/components/ScriptDialog";

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

// Helper to generate full script and test conversation per suggestion
const getSuggestionDialogContent = (suggestion: { title: string; description: string; impact: string }) => {
  const script = `Title: ${suggestion.title}
Description: ${suggestion.description}
Expected impact: ${suggestion.impact}`;
  const conversation = (
    <div>
      <b>You:</b> "How will you apply this in my company?"<br />
      <b>Coach:</b> {(() => {
        // Custom tailored explanation per strategy
        if (suggestion.title.includes("Activate Users")) {
          return (
            <>{"I will guide you to build a short onboarding checklist and set up quick rewards for the first three actions. This kickstarts team momentum, making users more likely to stick around and engage right away."}</>
          );
        }
        if (suggestion.title.includes("Cut CAC")) {
          return (
            <>{"We'll leverage your website click data to build a Meta Custom Audience. I'll walk you through launching a targeted retargeting campaign, maximizing previous engagement for cheaper conversions."}</>
          );
        }
        if (suggestion.title.includes("Increase Trial Conversion")) {
          return (
            <>{"I'll script an urgent Call-To-Action at day 6 of trial, intelligently offering a discount to hesitant users. This helps move users over the line before their trial expires."}</>
          );
        }
        // fallback default
        return "I'll walk you step-by-step through implementing this improvement, using AI to suggest timing and messaging that fits your goals.";
      })()}
    </div>
  );
  return { script, conversation };
};

export default function CoachingFeed() {
  const [feedbackLogs, setFeedbackLogs] = useState<any[]>([]);
  const [rankedSuggestions, setRankedSuggestions] = useState(suggestions);
  const { toast } = useToast();
  const { user } = useAuth();
  const { tenant } = useTenant();

  // New: Track open dialog index (-1 = none open)
  const [dialogIndex, setDialogIndex] = useState<number | null>(null);

  useEffect(() => {
    async function fetchFeedback() {
      if (!tenant?.id) return;
      
      try {
        const { data } = await supabase
          .from('strategy_feedback')
          .select('strategy_title, action')
          .eq('tenant_id', tenant.id);
          
        if (data) {
          setFeedbackLogs(data);
          const ranked = scoreSuggestions(suggestions, data);
          setRankedSuggestions(ranked);
        }
      } catch (error) {
        console.error("Error fetching feedback:", error);
      }
    }
    
    fetchFeedback();
  }, [tenant?.id]);

  const handleUseSuggestion = async (index: number) => {
    if (!tenant?.id) {
      toast({
        title: "Error",
        description: "Workspace not selected",
        variant: "destructive"
      });
      return;
    }
    
    const suggestion = rankedSuggestions[index];

    try {
      const { data, error } = await supabase
        .from('vault_strategies')
        .insert({
          title: suggestion.title,
          description: suggestion.description,
          tenant_id: tenant.id
        });

      await supabase
        .from('strategy_feedback')
        .insert({
          strategy_title: suggestion.title,
          action: 'used',
          tenant_id: tenant.id
        });

      if (error) {
        console.error("Error saving strategy:", error);
        throw error;
      }

      toast({
        title: "Strategy saved",
        description: "The strategy has been added to your vault",
      });
    } catch (error: any) {
      toast({
        title: "Error saving strategy",
        description: error.message || "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  const handleDismissSuggestion = async (index: number) => {
    if (!tenant?.id) return;
    
    const suggestion = rankedSuggestions[index];
    
    try {
      await supabase
        .from('strategy_feedback')
        .insert({
          strategy_title: suggestion.title,
          action: 'dismissed',
          tenant_id: tenant?.id
        });
      
      const updatedSuggestions = rankedSuggestions.filter((_, i) => i !== index);
      setRankedSuggestions(updatedSuggestions);
    } catch (error) {
      console.error("Error dismissing suggestion:", error);
    }
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
        rankedSuggestions.map((suggestion, index) => {
          const { script, conversation } = getSuggestionDialogContent(suggestion);
          return (
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
                <div className="flex flex-col gap-2 items-end">
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
                  {/* View (ScriptDialog) button */}
                  <ScriptDialog
                    label="View"
                    script={script}
                    testConversation={conversation}
                    variant="ghost"
                    buttonSize="sm"
                    // Dialog opens only for this index
                    // open and onOpenChange are used so only one at a time
                    open={dialogIndex === index}
                    onOpenChange={open => setDialogIndex(open ? index : null)}
                  />
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
