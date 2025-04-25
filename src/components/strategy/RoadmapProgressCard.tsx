
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RoadmapProgressCardProps {
  totalMilestones: number;
  completedMilestones: number;
  className?: string;
}

export function RoadmapProgressCard({ 
  totalMilestones, 
  completedMilestones, 
  className 
}: RoadmapProgressCardProps) {
  const navigate = useNavigate();
  const progress = totalMilestones > 0 
    ? Math.round((completedMilestones / totalMilestones) * 100) 
    : 0;
  
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle>Implementation Roadmap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Progress value={progress} className="h-2" />
          
          <div className="flex justify-between items-center">
            <div>
              <p className="text-2xl font-bold">{progress}%</p>
              <p className="text-sm text-muted-foreground">
                {completedMilestones} of {totalMilestones} milestones complete
              </p>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/strategy/roadmap')}
            >
              View Roadmap <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
