
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { StrategyHeader } from "./StrategyHeader";
import { StrategyActions } from "./StrategyActions";
import { StrategyTabs } from "./StrategyTabs";
import { StrategyVersions } from "./StrategyVersions";
import { StrategyKPIEvaluation } from "./StrategyKPIEvaluation";
import { StrategyRecommendations } from "./StrategyRecommendations";
import { StrategyFeedbackForm } from "@/components/StrategyFeedbackForm";
import { StrategyPerformanceTracker } from "@/components/StrategyPerformanceTracker";
import { useNavigate } from "react-router-dom";
import { useStrategyDetail } from "@/hooks/useStrategyDetail";
import { useQueryClient } from "@tanstack/react-query";

export function StrategyDetailContent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const {
    strategy,
    isLoading,
    error,
    comparisonData,
    versions,
    handleApprove,
    handleDecline,
    handleRegenerate,
    handleCreateVersion,
    handleCompareVersions
  } = useStrategyDetail(id);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center">
        <Loader2 className="animate-spin h-6 w-6" />
      </div>
    );
  }

  if (error || !strategy) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error ? (error as Error).message : "Strategy not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <StrategyHeader 
          strategy={strategy}
          onNavigate={navigate}
        />
        
        <CardContent>
          <StrategyTabs strategy={strategy}>
            {{
              overview: <p>{strategy.description}</p>,
              goals: <p>{strategy.goal || strategy.goals?.join(', ') || "No specific goals defined for this strategy."}</p>,
              performance: (
                <StrategyPerformanceTracker 
                  strategyId={strategy.id} 
                  initialMetrics={strategy.metrics_baseline || {}}
                />
              ),
              versions: (
                <StrategyVersions
                  strategy={strategy}
                  versions={versions || []}
                  onCreateVersion={(comment: string) => handleCreateVersion(comment)}
                  onCompareVersions={(v1: number, v2: number) => handleCompareVersions(v1, v2)}
                  comparisonData={comparisonData}
                />
              ),
              feedback: (
                <StrategyFeedbackForm 
                  strategyId={strategy.id}
                  onFeedbackSubmitted={() => queryClient.invalidateQueries({ queryKey: ['strategy-feedback', id] })}
                />
              ),
              evaluation: (
                <StrategyKPIEvaluation strategyId={strategy.id} />
              ),
              recommendations: (
                <StrategyRecommendations strategyId={strategy.id} />
              )
            }}
          </StrategyTabs>
        </CardContent>

        <StrategyActions
          onApprove={handleApprove}
          onDecline={handleDecline}
          onRegenerate={handleRegenerate}
        />
      </Card>
    </div>
  );
}
