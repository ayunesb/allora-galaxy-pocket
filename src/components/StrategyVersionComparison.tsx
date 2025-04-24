
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface StrategyVersionComparisonProps {
  olderVersion: {
    version: number;
    changes: string;
    created_at: string;
  };
  newerVersion: {
    version: number;
    changes: string;
    created_at: string;
  };
}

export function StrategyVersionComparison({ olderVersion, newerVersion }: StrategyVersionComparisonProps) {
  // Function to find differences between text
  const findDifferences = () => {
    const oldLines = olderVersion.changes.split('\n');
    const newLines = newerVersion.changes.split('\n');
    
    // Simple line-by-line comparison
    const maxLength = Math.max(oldLines.length, newLines.length);
    const diffLines = [];
    
    for (let i = 0; i < maxLength; i++) {
      const oldLine = i < oldLines.length ? oldLines[i] : '';
      const newLine = i < newLines.length ? newLines[i] : '';
      
      if (oldLine !== newLine) {
        diffLines.push({
          line: i + 1,
          old: oldLine,
          new: newLine,
          type: oldLine && newLine ? 'modified' : oldLine ? 'removed' : 'added'
        });
      }
    }
    
    return diffLines;
  };

  const differences = findDifferences();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          Comparing Version {olderVersion.version} → {newerVersion.version}
        </CardTitle>
        <CardDescription>
          Created on {format(new Date(olderVersion.created_at), 'PPp')} → {format(new Date(newerVersion.created_at), 'PPp')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="comparison">
          <TabsList className="mb-4">
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
            <TabsTrigger value="v1">Version {olderVersion.version}</TabsTrigger>
            <TabsTrigger value="v2">Version {newerVersion.version}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="comparison">
            <div className="space-y-4 max-h-[500px] overflow-y-auto bg-muted/20 p-4 rounded-md">
              <h3 className="text-lg font-medium">Changes ({differences.length})</h3>
              {differences.length === 0 ? (
                <p className="text-muted-foreground">No differences found between versions</p>
              ) : (
                <div className="space-y-2">
                  {differences.map((diff, index) => (
                    <div key={index} className="border rounded-md p-2">
                      <div className="text-xs text-muted-foreground mb-1">
                        Line {diff.line} - {diff.type === 'modified' ? 'Modified' : diff.type === 'added' ? 'Added' : 'Removed'}
                      </div>
                      {diff.old && (
                        <div className="bg-red-100 dark:bg-red-900/20 p-1 rounded mb-1 text-sm">
                          <span className="select-none mr-1">-</span> {diff.old}
                        </div>
                      )}
                      {diff.new && (
                        <div className="bg-green-100 dark:bg-green-900/20 p-1 rounded text-sm">
                          <span className="select-none mr-1">+</span> {diff.new}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="v1">
            <pre className="whitespace-pre-wrap max-h-[500px] overflow-y-auto bg-muted/20 p-4 rounded-md text-sm">
              {olderVersion.changes}
            </pre>
          </TabsContent>
          
          <TabsContent value="v2">
            <pre className="whitespace-pre-wrap max-h-[500px] overflow-y-auto bg-muted/20 p-4 rounded-md text-sm">
              {newerVersion.changes}
            </pre>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
