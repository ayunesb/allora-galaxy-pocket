
import React, { useState } from 'react';
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
  UserPlus,
  Calendar
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

interface SwipeCardProps {
  title: string;
  summary: string;
  type?: 'strategy' | 'campaign' | 'pricing' | 'hire';
  metadata?: any;
  isActive?: boolean;
  position?: number;
  animating?: boolean;
}

const SwipeCard = ({ 
  title, 
  summary, 
  type = 'strategy',
  metadata,
  isActive = false,
  position = 0,
  animating = false
}: SwipeCardProps) => {
  const [cardHeight, setCardHeight] = useState<number | undefined>(undefined);
  
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
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'campaign':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'pricing':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'hire':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const renderMetadata = () => {
    if (!metadata) return null;

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

  const onCardMount = (node: HTMLDivElement) => {
    if (node && !cardHeight) {
      setCardHeight(node.getBoundingClientRect().height);
    }
  };

  // Dynamic animation variants
  const variants = {
    active: { 
      scale: 1, 
      opacity: 1,
      zIndex: 10,
      transition: { duration: 0.3 } 
    },
    inactive: (custom: number) => ({ 
      scale: Math.max(0.9 - (custom * 0.05), 0.7), 
      opacity: Math.max(0.7 - (custom * 0.1), 0.3),
      zIndex: 10 - custom,
      transition: { duration: 0.3 }
    }),
    exit: (direction: 'left' | 'right') => ({
      x: direction === 'left' ? -500 : 500,
      opacity: 0,
      transition: { duration: 0.3 }
    })
  };

  return (
    <motion.div
      ref={onCardMount}
      initial={false}
      animate={isActive ? 'active' : 'inactive'}
      variants={variants}
      custom={position}
      className="absolute w-full"
      style={{ height: cardHeight }}
    >
      <Card className={`w-full ${animating ? 'pointer-events-none' : ''}`}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl">{title || 'Untitled'}</CardTitle>
            <Badge className={getTypeColor()}>
              <span className="flex items-center gap-1">
                {getIcon()}
                {getTypeLabel()}
              </span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{summary || 'No description provided'}</p>
        </CardContent>
        {renderMetadata() && (
          <CardFooter className="pt-0 border-t">
            {renderMetadata()}
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
};

export default SwipeCard;
