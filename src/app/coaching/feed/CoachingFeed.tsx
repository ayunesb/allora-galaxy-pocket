
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

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
  const [activeSuggestions, setActiveSuggestions] = useState(suggestions);

  const handleUseSuggestion = (index: number) => {
    // Placeholder for future implementation of using a suggestion
    console.log(`Using suggestion: ${activeSuggestions[index].title}`);
    // You might want to trigger some action or open a modal here
  };

  const handleDismissSuggestion = (index: number) => {
    const updatedSuggestions = activeSuggestions.filter((_, i) => i !== index);
    setActiveSuggestions(updatedSuggestions);
  };

  return (
    <div className="p-6 space-y-6 bg-soft-purple rounded-lg">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-dark-purple">🧠 AI Strategy Coach</h2>
      </div>
      {activeSuggestions.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No new suggestions at the moment. Check back later!
        </div>
      ) : (
        activeSuggestions.map((suggestion, index) => (
          <div 
            key={index} 
            className="bg-white p-5 rounded-lg shadow-md space-y-3 border-l-4 border-primary"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-dark-purple">{suggestion.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
                <span className="inline-block mt-2 text-xs bg-soft-green text-dark-purple px-2 py-1 rounded">
                  Impact: {suggestion.impact}
                </span>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-green-600 hover:bg-green-50"
                  onClick={() => handleUseSuggestion(index)}
                >
                  <Check className="mr-2 h-4 w-4" /> Use
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-gray-500 hover:bg-gray-50"
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
