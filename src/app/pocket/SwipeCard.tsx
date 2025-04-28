
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, 
  ClipboardCheck, 
  DollarSign, 
  UserPlus 
} from 'lucide-react';

interface SwipeCardProps {
  title: string;
  summary: string;
  type?: 'strategy' | 'campaign' | 'pricing' | 'hire';
  metadata?: any;
}

const SwipeCard = ({ title, summary, type = 'strategy', metadata }: SwipeCardProps) => {
  const getIcon = () => {
    switch (type) {
      case 'strategy':
        return <LineChart className="h-5 w-5" />;
      case 'campaign':
        return <ClipboardCheck className="h-5 w-5" />;
      case 'pricing':
        return <DollarSign className="h-5 w-5" />;
      case 'hire':
        return <UserPlus className="h-5 w-5" />;
      default:
        return <LineChart className="h-5 w-5" />;
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'strategy':
        return 'Strategy';
      case 'campaign':
        return 'Campaign';
      case 'pricing':
        return 'Pricing Decision';
      case 'hire':
        return 'Hiring Decision';
      default:
        return 'Decision';
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'strategy':
        return 'bg-blue-100 text-blue-800';
      case 'campaign':
        return 'bg-green-100 text-green-800';
      case 'pricing':
        return 'bg-purple-100 text-purple-800';
      case 'hire':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderMetadata = () => {
    if (!metadata) return null;

    switch (type) {
      case 'campaign':
        return metadata.budget ? (
          <div className="text-sm font-medium flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            Budget: ${metadata.budget.toLocaleString()}
          </div>
        ) : null;
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
      default:
        return null;
    }
  };

  return (
    <Card className="w-full mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{title}</CardTitle>
          <Badge className={getTypeColor()}>
            <span className="flex items-center gap-1">
              {getIcon()}
              {getTypeLabel()}
            </span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{summary}</p>
      </CardContent>
      {renderMetadata() && (
        <CardFooter className="pt-0 border-t">
          {renderMetadata()}
        </CardFooter>
      )}
    </Card>
  );
};

export default SwipeCard;
