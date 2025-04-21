
import { useState } from "react";
import SwipeCard from "./SwipeCard";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

const strategies = [
  { title: "Increase MRR with AI", summary: "Target high-LTV segments and deploy GPT follow-ups." },
  { title: "Boost Activation Rates", summary: "Incentivize first 3 actions with rewards and nudges." },
  { title: "Cut CAC by 25%", summary: "Refine Facebook ads and suppress non-converting cohorts." }
];

const PocketSwipe = () => {
  const [index, setIndex] = useState(0);
  const approve = () => setIndex((i) => i + 1);
  const decline = () => setIndex((i) => i + 1);

  if (index >= strategies.length) {
    return (
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">You're done! 🎉</h2>
        <Button onClick={() => setIndex(0)} variant="outline">Start Over</Button>
      </div>
    );
  }

  const current = strategies[index];
  return (
    <div className="space-y-4">
      <SwipeCard title={current.title} summary={current.summary} />
      <div className="grid grid-cols-2 gap-4">
        <Button 
          onClick={decline} 
          variant="destructive"
          className="w-full"
        >
          <X className="mr-2" />
          Decline
        </Button>
        <Button 
          onClick={approve} 
          className="w-full bg-green-600 hover:bg-green-700"
        >
          <Check className="mr-2" />
          Approve
        </Button>
      </div>
    </div>
  );
};

export default PocketSwipe;
