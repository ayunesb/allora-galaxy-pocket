
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, BarChart3, Calendar, Target, Lightbulb } from 'lucide-react';

export interface EmptyStrategiesStateProps {
  onCreateStrategy: () => void;
}

export function EmptyStrategiesState({ onCreateStrategy }: EmptyStrategiesStateProps) {
  return (
    <div className="text-center py-16">
      <div className="bg-muted inline-flex rounded-full p-3 mb-4">
        <Lightbulb className="h-6 w-6 text-primary" />
      </div>
      <h2 className="text-2xl font-semibold mb-3">No strategies yet</h2>
      <p className="text-muted-foreground max-w-md mx-auto mb-8">
        Create your first marketing strategy to start planning your campaigns and track performance metrics.
      </p>
      
      <Button onClick={onCreateStrategy} size="lg" className="mb-8">
        <PlusCircle className="mr-2 h-4 w-4" />
        Create Your First Strategy
      </Button>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
        <div className="bg-muted/50 p-4 rounded-lg text-center">
          <div className="bg-background inline-flex rounded-full p-2 mb-2">
            <Target className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-medium mb-1">Define Goals</h3>
          <p className="text-xs text-muted-foreground">Set clear objectives for your marketing efforts</p>
        </div>
        
        <div className="bg-muted/50 p-4 rounded-lg text-center">
          <div className="bg-background inline-flex rounded-full p-2 mb-2">
            <Calendar className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-medium mb-1">Plan Campaigns</h3>
          <p className="text-xs text-muted-foreground">Schedule and coordinate marketing activities</p>
        </div>
        
        <div className="bg-muted/50 p-4 rounded-lg text-center">
          <div className="bg-background inline-flex rounded-full p-2 mb-2">
            <BarChart3 className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-medium mb-1">Track Results</h3>
          <p className="text-xs text-muted-foreground">Measure performance and optimize strategies</p>
        </div>
      </div>
    </div>
  );
}
