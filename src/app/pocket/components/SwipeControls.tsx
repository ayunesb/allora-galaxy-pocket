
import React from 'react';
import { XCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { swipeHapticFeedback } from '@/utils/hapticFeedback';

interface SwipeControlsProps {
  onSwipe: (direction: 'left' | 'right') => void;
  viewedCount: number;
  hasActiveCards: boolean;
}

const SwipeControls = ({ onSwipe, viewedCount, hasActiveCards }: SwipeControlsProps) => {
  const handleSwipe = (direction: 'left' | 'right') => {
    swipeHapticFeedback(direction);
    onSwipe(direction);
  };

  return (
    <div className="mt-8">
      <div className="flex justify-center items-center space-x-8">
        <Button 
          onClick={() => handleSwipe('left')}
          size="lg"
          variant="outline"
          className="rounded-full h-16 w-16 flex items-center justify-center"
          disabled={!hasActiveCards}
        >
          <XCircle className="h-8 w-8 text-destructive" />
          <span className="sr-only">Dismiss</span>
        </Button>
        
        <Button 
          onClick={() => handleSwipe('right')}
          size="lg"
          variant="outline"
          className="rounded-full h-16 w-16 flex items-center justify-center"
          disabled={!hasActiveCards}
        >
          <CheckCircle className="h-8 w-8 text-success" />
          <span className="sr-only">Approve</span>
        </Button>
      </div>
      
      <div className="mt-4 text-center text-sm text-muted-foreground">
        {viewedCount} items viewed
      </div>
    </div>
  );
};

export default SwipeControls;
