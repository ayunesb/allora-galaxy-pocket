
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { PromptPerformanceStats } from "../components/PromptPerformanceStats";
import { AgentProfile } from "@/types/agent";

interface AgentSummaryCardProps {
  agent: AgentProfile;
  metrics?: {
    successRate: number;
    upvotes: number;
    downvotes: number;
  };
}

export default function AgentSummaryCard({ agent, metrics }: AgentSummaryCardProps) {
  const successRate = metrics?.successRate || 0;
  const upvotes = metrics?.upvotes || 0;
  const downvotes = metrics?.downvotes || 0;

  return (
    <Card className="h-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-lg font-semibold">{agent.agent_name}</CardTitle>
        <p className="text-sm text-muted-foreground">{agent.role}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Success Rate</span>
            <span className="text-sm text-muted-foreground">{successRate.toFixed(1)}%</span>
          </div>
          <Progress value={successRate} />
        </div>
        <PromptPerformanceStats upvotes={upvotes} downvotes={downvotes} />
      </CardContent>
    </Card>
  );
}
