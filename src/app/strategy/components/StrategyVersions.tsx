
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { StrategyVersionComparison } from "@/components/StrategyVersionComparison";
import { Input } from "@/components/ui/input";
import type { Strategy, StrategyVersionDiff, StrategyVersion } from "@/types/strategy";

interface StrategyVersionsProps {
  strategy: Strategy;
  versions: StrategyVersion[];
  onCreateVersion: (comment: string) => Promise<void>;
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
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateVersion = async () => {
    if (isCreating) return;
    
    try {
      setIsCreating(true);
      const versionComment = comment.trim() || "Version snapshot";
      await onCreateVersion(versionComment);
      setComment("");
    } catch (error) {
      console.error("Failed to create version:", error);
    } finally {
      setIsCreating(false);
    }
  };
  
  const handleCompare = async (v1: number, v2: number) => {
    try {
      await onCompareVersions(v1, v2);
      setShowVersionComparison(true);
    } catch (error) {
      console.error("Failed to compare versions:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <h3 className="font-medium">Version History</h3>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Input 
            placeholder="Version comment (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full sm:w-auto"
          />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCreateVersion}
            disabled={isCreating}
            className="w-full sm:w-auto"
          >
            {isCreating ? "Saving..." : "Save Current Version"}
          </Button>
        </div>
      </div>
      
      {versions && versions.length > 0 ? (
        <div className="space-y-2">
          {versions.map((version, index) => (
            <div key={version.id} className="border rounded-lg p-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <span className="font-medium">Version {version.version}</span>
                  <span className="text-sm text-muted-foreground ml-2">
                    {format(new Date(version.created_at), 'PPp')}
                  </span>
                  {version.comment && (
                    <div className="text-sm text-muted-foreground mt-1">
                      Comment: {version.comment}
                    </div>
                  )}
                </div>
                {index > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleCompare(versions[index].version, versions[index-1].version)}
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
