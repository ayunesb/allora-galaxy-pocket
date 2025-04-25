
import React from 'react';
import { StrategicRoadmap } from '@/components/strategy/StrategicRoadmap';
import { useRoadmapMilestones } from '@/hooks/useRoadmapMilestones';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';

export default function StrategicRoadmapPage() {
  const { 
    milestones, 
    isLoading, 
    error, 
    completedCount, 
    totalCount, 
    overallProgress 
  } = useRoadmapMilestones();

  // Handle loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Handle error state
  if (error) {
    toast.error('Failed to load roadmap', {
      description: 'Could not load strategic milestones'
    });
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Strategic Roadmap</h1>
        <Button>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Milestone
        </Button>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <StrategicRoadmap 
            milestones={milestones}
            overallProgress={overallProgress}
          />
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Roadmap Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground">Total Milestones</div>
                  <div className="text-2xl font-bold">{totalCount}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                  <div className="text-2xl font-bold text-green-600">{completedCount}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Remaining</div>
                  <div className="text-2xl font-bold text-amber-600">{totalCount - completedCount}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
