
import React from 'react';
import { Strategy } from '@/types/strategy';
import { Button } from '@/components/ui/button';
import { Share2, FileDown, Trash2, ArrowLeft } from 'lucide-react';
import { NavigateFunction } from 'react-router-dom';

interface StrategyHeaderProps {
  strategy: Strategy;
  onShare?: () => void;
  onExport?: () => void;
  onDelete?: () => void;
  onNavigate: NavigateFunction;
}

export function StrategyHeader({ 
  strategy, 
  onShare, 
  onExport, 
  onDelete,
  onNavigate
}: StrategyHeaderProps) {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onNavigate('/strategy')}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Strategies
        </Button>
        
        <div className="flex items-center space-x-2">
          {onShare && (
            <Button
              variant="outline"
              size="sm"
              onClick={onShare}
              className="flex items-center gap-1"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          )}
          
          {onExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="flex items-center gap-1"
            >
              <FileDown className="h-4 w-4" />
              Export
            </Button>
          )}
          
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive border-destructive hover:bg-destructive/10 flex items-center gap-1"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </div>
      
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold">{strategy.title}</h1>
        {strategy.description && (
          <p className="text-muted-foreground mt-1">{strategy.description}</p>
        )}
        
        <div className="flex mt-2 flex-wrap gap-2">
          {strategy.tags && strategy.tags.map((tag, index) => (
            <span 
              key={index}
              className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
