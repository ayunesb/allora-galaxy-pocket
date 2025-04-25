
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Strategy } from "@/types/strategy";

interface StrategyCardProps {
  strategy: Strategy;
  onClick: (strategy: Strategy) => void;
}

export function StrategyCard({ strategy, onClick }: StrategyCardProps) {
  return (
    <Card 
      key={strategy.id}
      className="cursor-pointer hover:shadow-md transition-all"
      onClick={() => onClick(strategy)}
    >
      <CardHeader>
        <CardTitle>{strategy.title}</CardTitle>
        <CardDescription>
          {strategy.status === 'approved' ? 'Active' : 'Pending'} • Created{' '}
          {new Date(strategy.created_at).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {strategy.description || "No description available"}
        </p>
        
        {strategy.tags && strategy.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-4">
            {strategy.tags.map((tag, i) => (
              <span 
                key={i} 
                className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded-md text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
