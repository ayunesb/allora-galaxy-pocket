
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, TrendingUp, BarChart } from 'lucide-react';
import { Link } from 'react-router-dom';

interface KpiEmptyStateProps {
  onAddKpi?: () => void;
}

export function KpiEmptyState({ onAddKpi }: KpiEmptyStateProps) {
  return (
    <Card className="w-full border-dashed">
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          No KPI Metrics Found
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center p-6 text-center">
        <BarChart className="h-16 w-16 text-muted-foreground opacity-50 mb-4" />
        <p className="text-muted-foreground mb-6">
          You haven't added any KPI metrics yet. Create your first metric to start tracking performance.
        </p>
      </CardContent>
      <CardFooter className="flex justify-center pb-6">
        {onAddKpi ? (
          <Button onClick={onAddKpi}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add First KPI
          </Button>
        ) : (
          <Button asChild>
            <Link to="/kpi/add" className="flex items-center">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add First KPI
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
