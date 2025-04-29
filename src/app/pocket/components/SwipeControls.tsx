
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { ContentCard } from '@/utils/swipeHandlers';

interface SwipeControlsProps {
  onSwipe: (direction: 'left' | 'right') => void;
  viewedCount: number;
  hasActiveCards: boolean;
}

const SwipeControls = ({ onSwipe, viewedCount, hasActiveCards }: SwipeControlsProps) => {
  if (!hasActiveCards) return null;
  
  return (
    <div className="mt-6 flex justify-between items-center">
      <Button 
        variant="outline" 
        size="icon" 
        className="rounded-full h-12 w-12 bg-red-50 hover:bg-red-100 border-red-200"
        onClick={() => onSwipe('left')}
      >
        <X className="h-6 w-6 text-red-500" />
      </Button>
      
      <div className="text-sm text-gray-500">
        {viewedCount > 0 ? `You've viewed ${viewedCount} recommendations` : 'Swipe right to approve, left to dismiss'}
      </div>
      
      <Button 
        variant="outline" 
        size="icon" 
        className="rounded-full h-12 w-12 bg-green-50 hover:bg-green-100 border-green-200"
        onClick={() => onSwipe('right')}
      >
        <Check className="h-6 w-6 text-green-500" />
      </Button>
    </div>
  );
};

export default SwipeControls;
