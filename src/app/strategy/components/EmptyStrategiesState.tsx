
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Plus } from "lucide-react";

interface EmptyStrategiesStateProps {
  onCreateStrategy: () => void;
}

export function EmptyStrategiesState({ onCreateStrategy }: EmptyStrategiesStateProps) {
  return (
    <Card className="bg-muted/40">
      <CardContent className="flex flex-col items-center justify-center p-10 text-center">
        <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium">No strategies yet</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          Create your first growth strategy to start boosting your business metrics
        </p>
        <Button onClick={onCreateStrategy} className="flex gap-2 items-center">
          <Plus className="h-4 w-4" /> Create First Strategy
        </Button>
      </CardContent>
    </Card>
  );
}
