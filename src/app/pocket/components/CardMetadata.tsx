
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { DollarSign, Calendar } from 'lucide-react';
import { CardFooter } from '@/components/ui/card';

interface CardMetadataProps {
  type: 'strategy' | 'campaign' | 'pricing' | 'hire';
  metadata: any;
}

const CardMetadata: React.FC<CardMetadataProps> = ({ type, metadata }) => {
  if (!metadata) return null;

  const renderContent = () => {
    switch (type) {
      case 'campaign':
        return (
          <div className="flex flex-col gap-2">
            {metadata.budget ? (
              <div className="text-sm font-medium flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                Budget: ${metadata.budget.toLocaleString()}
              </div>
            ) : null}
            {metadata.created_at && (
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Created {formatDistanceToNow(new Date(metadata.created_at), { addSuffix: true })}
              </div>
            )}
          </div>
        );
      
      case 'pricing':
        return metadata.suggestedPrice ? (
          <div className="flex gap-4 text-sm">
            <div>Current: ${metadata.currentPrice}</div>
            <div className="font-medium">Suggested: ${metadata.suggestedPrice}</div>
          </div>
        ) : null;
      
      case 'hire':
        return metadata.salary_range ? (
          <div className="text-sm">
            Salary: {metadata.salary_range}
          </div>
        ) : null;
      
      case 'strategy':
        return (
          <div className="flex flex-col gap-1">
            {metadata.industry && (
              <div className="text-xs text-muted-foreground">
                Industry: {metadata.industry}
              </div>
            )}
            {metadata.created_at && (
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Created {formatDistanceToNow(new Date(metadata.created_at), { addSuffix: true })}
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  const content = renderContent();
  
  return content ? (
    <CardFooter className="pt-0 border-t">
      {content}
    </CardFooter>
  ) : null;
};

export default CardMetadata;
