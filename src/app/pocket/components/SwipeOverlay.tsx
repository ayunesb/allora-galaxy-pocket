
import React from 'react';
import { Check, X } from 'lucide-react';

interface SwipeOverlayProps {
  swipingDirection: 'left' | 'right' | null;
}

const SwipeOverlay = ({ swipingDirection }: SwipeOverlayProps) => {
  if (!swipingDirection) return null;
  
  return (
    <div 
      className={`absolute inset-0 ${
        swipingDirection === 'right' ? 'bg-green-100/80' : 
        'bg-red-100/80'
      } transition-colors duration-200 z-10 pointer-events-none rounded-lg`}
    >
      {swipingDirection === 'right' && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Check className="h-24 w-24 text-green-500" />
        </div>
      )}
      {swipingDirection === 'left' && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <X className="h-24 w-24 text-red-500" />
        </div>
      )}
    </div>
  );
};

export default SwipeOverlay;
