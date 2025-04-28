
import React from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";

export interface PromptPerformanceStatsProps {
  upvotes: number;
  downvotes: number;
}

export default function PromptPerformanceStats({ upvotes, downvotes }: PromptPerformanceStatsProps) {
  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center">
        <ThumbsUp className="h-4 w-4 text-green-500 mr-1" />
        <span className="text-sm">{upvotes}</span>
      </div>
      <div className="flex items-center">
        <ThumbsDown className="h-4 w-4 text-red-500 mr-1" />
        <span className="text-sm">{downvotes}</span>
      </div>
    </div>
  );
}

// Also export named export
export { PromptPerformanceStats };
