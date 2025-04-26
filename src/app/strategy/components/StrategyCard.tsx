
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight, Target } from "lucide-react";
import type { Strategy } from "@/types/strategy";

interface StrategyCardProps {
  strategy: Strategy;
  onClick: (strategy: Strategy) => void;
}

export function StrategyCard({ strategy, onClick }: StrategyCardProps) {
  // Status badge style helpers
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200';
      case 'pending': return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
      case 'draft': return 'bg-slate-100 text-slate-800 hover:bg-slate-200';
      case 'rejected': return 'bg-rose-100 text-rose-800 hover:bg-rose-200';
      default: return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    }
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-all overflow-hidden border"
      onClick={() => onClick(strategy)}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="mb-1">{strategy.title || "Untitled Strategy"}</CardTitle>
            <CardDescription>
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                <span>Created {new Date(strategy.created_at).toLocaleDateString()}</span>
              </div>
            </CardDescription>
          </div>
          <Badge className={getStatusColor(strategy.status)}>
            {strategy.status || "Draft"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="line-clamp-3 text-sm text-muted-foreground mb-3">
          {strategy.description || "No description provided for this marketing strategy."}
        </p>
        
        {strategy.impact_score && (
          <div className="flex items-center space-x-1 text-sm">
            <Target className="h-3.5 w-3.5 text-primary" />
            <span className="font-medium">Impact Score:</span>
            <span className="text-muted-foreground">{strategy.impact_score}</span>
          </div>
        )}
        
        {strategy.tags && strategy.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
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
      
      <CardFooter className="bg-muted/50 pt-3">
        <Button variant="ghost" size="sm" className="ml-auto group">
          View Details
          <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
        </Button>
      </CardFooter>
    </Card>
  );
}
