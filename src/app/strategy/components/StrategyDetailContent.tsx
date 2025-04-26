
import React, { useState, useCallback } from "react";
import { useStrategyDetail } from "@/hooks/useStrategyDetail";
import { Strategy, StrategyVersion } from "@/types/strategy";
import { StrategyDetailHeader } from "./StrategyDetailHeader";
import { StrategyVersions } from "./StrategyVersions";
import { StrategyVersionComparison } from "./StrategyVersionComparison";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface StrategyDetailContentProps {
  strategyId: string;
}

export function StrategyDetailContent({ strategyId }: StrategyDetailContentProps) {
  const { 
    strategy, 
    versions, 
    isLoading, 
    error,
    createNewVersion 
  } = useStrategyDetail(strategyId);

  const [selectedVersions, setSelectedVersions] = useState<{
    v1: StrategyVersion | null;
    v2: StrategyVersion | null;
  }>({
    v1: null,
    v2: null
  });

  const handleSelectVersions = useCallback((v1: StrategyVersion, v2: StrategyVersion) => {
    setSelectedVersions({ v1, v2 });
  }, []);

  const handleCreateNewVersion = useCallback(async (comment: string) => {
    if (strategy) {
      await createNewVersion(comment);
    }
  }, [strategy, createNewVersion]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[400px]">
        <LoadingSpinner size={40} label="Loading strategy details..." />
      </div>
    );
  }

  if (error || !strategy) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error || "Failed to load strategy details"}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      <StrategyDetailHeader 
        strategy={strategy as Strategy} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <StrategyVersions 
            versions={versions}
            onCreateVersion={handleCreateNewVersion}
            onCompareVersions={handleSelectVersions}
          />
        </div>
        <div className="lg:col-span-2">
          {selectedVersions.v1 && selectedVersions.v2 ? (
            <StrategyVersionComparison 
              v1={selectedVersions.v1} 
              v2={selectedVersions.v2} 
            />
          ) : (
            <div className="border rounded-lg p-6 bg-background">
              <p className="text-center text-muted-foreground">
                Select two versions to compare
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
