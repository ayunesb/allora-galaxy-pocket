
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { StrategyVersionComparison } from "@/components/StrategyVersionComparison";
import type { Strategy, StrategyVersionDiff } from "@/types/strategy";

interface StrategyVersionsProps {
  strategy: Strategy;
  versions: any[];
  onCreateVersion: (comment: string) => void;
  onCompareVersions: (v1: number, v2: number) => Promise<void>;
  comparisonData: StrategyVersionDiff | null;
}

export function StrategyVersions({ 
  strategy,
  versions,
  onCreateVersion,
  onCompareVersions,
  comparisonData
}: StrategyVersionsProps) {
  const [showVersionComparison, setShowVersionComparison] = useState(false);
  const [comment, setComment] = useState("");

  const handleCreateVersion = () => {
    if (comment.trim()) {
      onCreateVersion(comment);
      setComment("");
    } else {
      // Default comment if none provided
      onCreateVersion("Version snapshot");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Version History</h3>
        <Button variant="outline" size="sm" onClick={handleCreateVersion}>
          Save Current Version
        </Button>
      </div>
      
      {versions && versions.length > 0 ? (
        <div className="space-y-2">
          {versions.map((version, index) => (
            <div key={version.id} className="border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">Version {version.version}</span>
                  <span className="text-sm text-muted-foreground ml-2">
                    {format(new Date(version.created_at), 'PPp')}
                  </span>
                </div>
                {index > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onCompareVersions(versions[index].version, versions[index-1].version)}
                  >
                    Compare with V{versions[index-1].version}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-muted-foreground">
          No versions saved yet. Click "Save Current Version" to create the first version.
        </div>
      )}
      
      {showVersionComparison && comparisonData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg w-full max-w-4xl overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-lg">Version Comparison</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowVersionComparison(false)}>
                Close
              </Button>
            </div>
            <div className="p-4">
              <StrategyVersionComparison
                olderVersion={comparisonData.older}
                newerVersion={comparisonData.newer}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
