
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StrategyVersion } from '@/types/strategy';
import { CheckIcon, ClockIcon, PlusCircleIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface StrategyVersionsProps {
  versions: StrategyVersion[];
  onCreateVersion: (comment: string) => Promise<void>;
  onCompareVersions: (v1: StrategyVersion, v2: StrategyVersion) => void;
}

export function StrategyVersions({ 
  versions, 
  onCreateVersion,
  onCompareVersions 
}: StrategyVersionsProps) {
  const [comment, setComment] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showNewVersionForm, setShowNewVersionForm] = useState(false);
  const [selectedVersions, setSelectedVersions] = useState<StrategyVersion[]>([]);

  const handleSelectVersion = (version: StrategyVersion) => {
    setSelectedVersions(prev => {
      const isSelected = prev.some(v => v.id === version.id);
      
      if (isSelected) {
        return prev.filter(v => v.id !== version.id);
      } else {
        const newSelected = [...prev, version].slice(-2);
        return newSelected;
      }
    });
  };

  const handleCreateVersion = async () => {
    if (!comment.trim()) return;
    
    setIsCreating(true);
    try {
      await onCreateVersion(comment);
      setComment('');
      setShowNewVersionForm(false);
    } catch (error) {
      console.error('Failed to create version:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCompareSelected = () => {
    if (selectedVersions.length === 2) {
      onCompareVersions(selectedVersions[0], selectedVersions[1]);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl">Version History</CardTitle>
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => setShowNewVersionForm(prev => !prev)}
        >
          <PlusCircleIcon className="h-4 w-4 mr-1" />
          New Version
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {showNewVersionForm && (
          <div className="border rounded-md p-3 space-y-3 bg-muted/20">
            <Textarea
              placeholder="Version comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="resize-none"
              rows={3}
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" size="sm" onClick={() => setShowNewVersionForm(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleCreateVersion} disabled={!comment.trim() || isCreating}>
                {isCreating ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </div>
        )}

        {versions.length > 0 && (
          <div className="space-y-2">
            {selectedVersions.length === 2 && (
              <Button 
                className="w-full mb-2" 
                onClick={handleCompareSelected}
                variant="outline"
                size="sm"
              >
                Compare Selected Versions
              </Button>
            )}
            
            <div className="space-y-2">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className={`
                    border rounded-md p-2 flex justify-between items-start 
                    ${selectedVersions.some(v => v.id === version.id) ? 'border-primary bg-primary/5' : ''}
                    cursor-pointer hover:bg-accent transition-colors
                  `}
                  onClick={() => handleSelectVersion(version)}
                >
                  <div>
                    <div className="flex items-center">
                      <span className="font-medium">Version {version.version || 'Unknown'}</span>
                      {selectedVersions.some(v => v.id === version.id) && (
                        <CheckIcon className="h-4 w-4 ml-1 text-primary" />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {version.comment || "No comment"}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <ClockIcon className="h-3 w-3 mr-1" />
                      {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {versions.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            No versions available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
