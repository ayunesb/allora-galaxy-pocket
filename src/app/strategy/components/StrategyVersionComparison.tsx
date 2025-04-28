
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StrategyVersion } from '@/types/strategy';
import { differenceInDays, format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface StrategyVersionComparisonProps {
  v1: StrategyVersion;
  v2: StrategyVersion;
}

export function StrategyVersionComparison({ v1, v2 }: StrategyVersionComparisonProps) {
  // Order versions chronologically
  const [older, newer] = (v1.version_number || v1.version || 0) < (v2.version_number || v2.version || 0) ? [v1, v2] : [v2, v1];
  
  // Extract core data for comparison
  const data1 = older.data || {};
  const data2 = newer.data || {};
  
  // Calculate time difference
  const daysDiff = differenceInDays(new Date(newer.created_at), new Date(older.created_at));
  
  // Find differences between the two versions
  const changes = getChanges(data1, data2);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Version Comparison</span>
          <Badge variant="outline">{daysDiff} days between versions</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="border rounded-md p-4">
            <div className="font-medium mb-2">Version {older.version_number || older.version || 'Unknown'}</div>
            <div className="text-sm text-muted-foreground">
              {format(new Date(older.created_at), 'PPP')}
            </div>
            <div className="text-sm mt-2">{older.comment || "No comment"}</div>
          </div>
          <div className="border rounded-md p-4">
            <div className="font-medium mb-2">Version {newer.version_number || newer.version || 'Unknown'}</div>
            <div className="text-sm text-muted-foreground">
              {format(new Date(newer.created_at), 'PPP')}
            </div>
            <div className="text-sm mt-2">{newer.comment || "No comment"}</div>
          </div>
        </div>

        {changes.added.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium">Added</h3>
            <ul className="list-disc list-inside text-green-600">
              {changes.added.map((key, i) => (
                <li key={i}>{key}: {JSON.stringify(data2[key])}</li>
              ))}
            </ul>
          </div>
        )}

        {changes.removed.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium">Removed</h3>
            <ul className="list-disc list-inside text-red-600">
              {changes.removed.map((key, i) => (
                <li key={i}>{key}: {JSON.stringify(data1[key])}</li>
              ))}
            </ul>
          </div>
        )}

        {Object.keys(changes.modified).length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium">Modified</h3>
            <ul className="list-disc list-inside text-amber-600">
              {Object.entries(changes.modified).map(([key, { before, after }], i) => (
                <li key={i}>
                  {key}: <span className="text-red-600">{JSON.stringify(before)}</span> → 
                  <span className="text-green-600">{JSON.stringify(after)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {changes.added.length === 0 && 
         changes.removed.length === 0 && 
         Object.keys(changes.modified).length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            No differences found between these versions
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getChanges(obj1: Record<string, any>, obj2: Record<string, any>) {
  const result = {
    added: [] as string[],
    removed: [] as string[],
    modified: {} as Record<string, {before: any, after: any}>
  };
  
  // Find added and modified properties
  for (const key in obj2) {
    if (!(key in obj1)) {
      result.added.push(key);
    } else if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
      result.modified[key] = {
        before: obj1[key],
        after: obj2[key]
      };
    }
  }
  
  // Find removed properties
  for (const key in obj1) {
    if (!(key in obj2)) {
      result.removed.push(key);
    }
  }
  
  return result;
}
