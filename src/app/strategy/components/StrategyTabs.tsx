
import { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList } from "lucide-react";
import type { Strategy } from "@/types/strategy";

interface StrategyTabsProps {
  strategy: Strategy;
  children: {
    overview: ReactNode;
    goals: ReactNode;
    performance: ReactNode;
    versions: ReactNode;
    feedback: ReactNode;
  };
}

export function StrategyTabs({ strategy, children }: StrategyTabsProps) {
  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="goals">Goals</TabsTrigger>
        <TabsTrigger value="performance">Performance</TabsTrigger>
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
      <TabsContent value="versions" className="mt-4">
        {children.versions}
      </TabsContent>
      <TabsContent value="feedback" className="mt-4">
        {children.feedback}
      </TabsContent>
    </Tabs>
  );
}
