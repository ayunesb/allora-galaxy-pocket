
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLaunchReadiness } from '@/hooks/useLaunchReadiness';

export default function LaunchReadinessButton() {
  const { healthScore, status, isRunning, runChecks } = useLaunchReadiness(true);

  // Run checks automatically on mount
  useEffect(() => {
    if (!isRunning && healthScore === 0) {
      runChecks();
    }
  }, [isRunning, healthScore, runChecks]);

  const getStatusColor = () => {
    if (status === "complete" && healthScore >= 90) {
      return 'bg-green-500 text-white';
    } else if (status === "complete" && healthScore >= 70) {
      return 'bg-amber-500 text-white';
    } else if (status === "error" || (status === "complete" && healthScore < 70)) {
      return 'bg-red-500 text-white';
    } else {
      return 'bg-gray-500 text-white';
    }
  };

  return (
    <Link to="/launch-readiness">
      <Button variant="outline" className="relative flex items-center gap-2">
        {isRunning ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Zap className="h-4 w-4" />
        )}
        <span>Launch Readiness</span>
        <Badge className={`absolute -top-2 -right-2 ${getStatusColor()}`}>
          {isRunning ? '...' : `${healthScore}%`}
        </Badge>
      </Button>
    </Link>
  );
}
