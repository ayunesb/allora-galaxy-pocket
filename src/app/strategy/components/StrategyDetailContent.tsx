
import React, { useState, useCallback } from "react";
import { useStrategyDetail } from "@/hooks/useStrategyDetail";
import { Strategy, StrategyVersion } from "@/types/strategy";
import { StrategyDetailHeader } from "./StrategyDetailHeader";
import { StrategyVersions } from "./StrategyVersions";
import { StrategyVersionComparison } from "./StrategyVersionComparison";
import { DataLoader } from "@/components/ui/data-loader"; 

interface StrategyDetailContentProps {
  strategyId: string;
}

export function StrategyDetailContent({ strategyId }: StrategyDetailContentProps) {
  const { 
    strategy, 
    versions, 
    isLoading, 
    error,
    createNewVersion, 
    refresh
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

  return (
    <DataLoader
      isLoading={isLoading}
      isError={!!error}
      error={error}
      data={strategy}
      loadingMessage="Loading strategy details..."
      errorTitle="Failed to load strategy"
      onRetry={refresh}
    >
      {(strategyData) => (
        <div className="space-y-8">
          <StrategyDetailHeader strategy={strategyData} />

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
      )}
    </DataLoader>
  );
}
