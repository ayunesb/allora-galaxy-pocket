
import React from 'react';
import { RoadmapProgressCard } from '@/components/strategy/RoadmapProgressCard';
import { useRoadmapMilestones } from '@/hooks/useRoadmapMilestones';

export function RoadmapCard() {
  const { completedCount, totalCount, isLoading } = useRoadmapMilestones();

  if (isLoading) {
    return null;
  }

  return (
    <RoadmapProgressCard
      totalMilestones={totalCount}
      completedMilestones={completedCount}
    />
  );
}
