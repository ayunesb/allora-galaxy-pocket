
import { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, Activity, LineChart } from "lucide-react";
import type { Strategy } from "@/types/strategy";

interface StrategyTabsProps {
  strategy: Strategy;
  children: {
    overview: ReactNode;
    goals: ReactNode;
    performance: ReactNode;
    versions: ReactNode;
    feedback: ReactNode;
    evaluation: ReactNode;
    recommendations: ReactNode;
  };
}

export function StrategyTabs({ strategy, children }: StrategyTabsProps) {
  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="goals">Goals</TabsTrigger>
        <TabsTrigger value="performance">Performance</TabsTrigger>
        <TabsTrigger value="evaluation" className="flex items-center gap-1">
          <Activity className="h-4 w-4" /> KPI Evaluation
        </TabsTrigger>
        <TabsTrigger value="recommendations" className="flex items-center gap-1">
          <LineChart className="h-4 w-4" /> Recommendations
        </TabsTrigger>
        <TabsTrigger value="versions">Versions</TabsTrigger>
        <TabsTrigger value="feedback" className="flex items-center gap-1">
          <ClipboardList className="h-4 w-4" /> Feedback
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="mt-4">
        {children.overview}
      </TabsContent>
      <TabsContent value="goals" className="mt-4">
        {children.goals}
      </TabsContent>
      <TabsContent value="performance" className="mt-4">
        {children.performance}
      </TabsContent>
      <TabsContent value="evaluation" className="mt-4">
        {children.evaluation}
      </TabsContent>
      <TabsContent value="recommendations" className="mt-4">
        {children.recommendations}
      </TabsContent>
      <TabsContent value="versions" className="mt-4">
        {children.versions}
      </TabsContent>
      <TabsContent value="feedback" className="mt-4">
        {children.feedback}
      </TabsContent>
    </Tabs>
  );
}
