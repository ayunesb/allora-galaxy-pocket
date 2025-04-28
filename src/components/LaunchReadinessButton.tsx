
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLaunchReadiness } from '@/hooks/useLaunchReadiness';

export default function LaunchReadinessButton() {
  const { healthScore, status, isChecking, runChecks } = useLaunchReadiness(true);

  // Run checks automatically on mount
  useEffect(() => {
    if (!isChecking && healthScore === 0) {
      runChecks();
    }
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'ready':
        return 'bg-green-500 text-white';
      case 'warning':
        return 'bg-amber-500 text-white';
      case 'critical':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <Link to="/launch-readiness">
      <Button variant="outline" className="relative flex items-center gap-2">
        {isChecking ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Zap className="h-4 w-4" />
        )}
        <span>Launch Readiness</span>
        <Badge className={`absolute -top-2 -right-2 ${getStatusColor()}`}>
          {isChecking ? '...' : `${healthScore}%`}
        </Badge>
      </Button>
    </Link>
  );
}
