
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles } from "lucide-react";
import { useCreditsManager } from "@/hooks/useCreditsManager";
import { CreditCheckModal } from "@/components/billing/CreditCheckModal";
import { toast } from "sonner";

export function StrategyGenerator() {
  const [prompt, setPrompt] = useState("");
  const [title, setTitle] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);
  
  const { useCredits, hasEnoughCredits } = useCreditsManager();
  
  // This is the number of credits required to generate a strategy
  const REQUIRED_CREDITS = 10;
  
  const handleGenerate = async () => {
    if (!prompt || !title) {
      toast.error("Please provide both a title and description for your strategy");
      return;
    }
    
    // First, check if user has enough credits
    if (!hasEnoughCredits(REQUIRED_CREDITS)) {
      toast.error("Not enough credits", {
        description: `You need ${REQUIRED_CREDITS} credits to generate a strategy. Please upgrade your plan.`,
      });
      return;
    }
    
    setShowCreditModal(true);
  };
  
  const handleConfirmedGenerate = async () => {
    setShowCreditModal(false);
    setIsGenerating(true);
    
    try {
      // Use the credits
      const success = await useCredits(REQUIRED_CREDITS, "Strategy Generation", "CEO_Agent");
      
      if (!success) {
        throw new Error("Failed to use credits");
      }
      
      // Proceed with strategy generation
      // In a real implementation, this would call an API endpoint or supabase function
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      toast.success("Strategy generated successfully", {
        description: "Your new strategy is ready to review and launch.",
      });
      
      // Reset the form
      setPrompt("");
      setTitle("");
    } catch (error) {
      console.error("Error generating strategy:", error);
      toast.error("Failed to generate strategy", {
        description: "Please try again later",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <>
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Generate New Strategy</h2>
        <p className="text-muted-foreground mb-6">
          Create an AI-powered growth strategy for your business. This will use {REQUIRED_CREDITS} credits.
        </p>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Strategy Title</Label>
            <Input
              id="title"
              placeholder="E.g., Q4 Growth Plan"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="prompt">
              Strategy Description
            </Label>
            <Textarea
              id="prompt"
              placeholder="Describe what you want to achieve with this strategy..."
              rows={4}
              className="resize-none"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>
          
          <Button 
            className="w-full"
            onClick={handleGenerate}
            disabled={isGenerating || !prompt || !title}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Strategy ({REQUIRED_CREDITS} credits)
              </>
            )}
          </Button>
        </div>
      </Card>
      
      <CreditCheckModal
        isOpen={showCreditModal}
        onClose={() => setShowCreditModal(false)}
        requiredCredits={REQUIRED_CREDITS}
        featureDescription="Generate an AI-powered growth strategy tailored to your business goals. This strategy will be ready to launch or can be saved in your vault for later use."
        onProceed={handleConfirmedGenerate}
      />
    </>
  );
}
