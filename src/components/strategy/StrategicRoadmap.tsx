
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock } from 'lucide-react';

interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
}

interface StrategicRoadmapProps {
  milestones: Milestone[];
  overallProgress: number;
  className?: string;
}

export function StrategicRoadmap({ milestones, overallProgress, className }: StrategicRoadmapProps) {
  // Sort milestones by completion status (completed first)
  const sortedMilestones = [...milestones].sort((a, b) => {
    if (a.completed && !b.completed) return -1;
    if (!a.completed && b.completed) return 1;
    return 0;
  });

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold">Strategic Roadmap</CardTitle>
        <div className="flex items-center gap-2 mt-2">
          <Progress value={overallProgress} className="h-2 flex-1" />
          <span className="text-sm font-medium">{overallProgress}% Complete</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedMilestones.map((milestone) => (
            <div key={milestone.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
              <div className="mt-0.5">
                {milestone.completed ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <Clock className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <h3 className={`font-medium ${milestone.completed ? 'text-green-600 dark:text-green-400' : ''}`}>
                  {milestone.title}
                </h3>
                {milestone.dueDate && (
                  <p className="text-sm text-muted-foreground">
                    Due: {milestone.dueDate}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
