
import React from 'react';
import { Badge } from '@/components/ui/badge';
import CardIcon from './CardIcon';

interface CardTypeBadgeProps {
  type: 'strategy' | 'campaign' | 'pricing' | 'hire';
}

const CardTypeBadge: React.FC<CardTypeBadgeProps> = ({ type }) => {
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

  return (
    <Badge className={getTypeColor()}>
      <span className="flex items-center gap-1">
        <CardIcon type={type} />
        {getTypeLabel()}
      </span>
    </Badge>
  );
};

export default CardTypeBadge;
