
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface MilestoneTagsProps {
  milestones: {
    id: string;
    title: string;
    completed: boolean;
  }[];
  limit?: number;
  showCount?: boolean;
}

export function MilestoneTags({ milestones, limit = 3, showCount = true }: MilestoneTagsProps) {
  const displayMilestones = milestones.slice(0, limit);
  const remaining = milestones.length - limit;
  
  return (
    <div className="flex flex-wrap gap-2">
      {displayMilestones.map((milestone) => (
        <Badge 
          key={milestone.id} 
          variant={milestone.completed ? "default" : "outline"}
          className={milestone.completed ? "bg-green-600" : ""}
        >
          {milestone.title}
        </Badge>
      ))}
      
      {showCount && remaining > 0 && (
        <Badge variant="outline">
          +{remaining} more
        </Badge>
      )}
    </div>
  );
}
