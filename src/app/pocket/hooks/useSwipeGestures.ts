
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSystemLogs } from '@/hooks/useSystemLogs';
import { 
  handleStrategySwipe, 
  handleCampaignSwipe, 
  handleDecisionSwipe,
  ContentCard 
} from '@/utils/swipeHandlers';

export function useSwipeGestures() {
  const [swipingDirection, setSwipingDirection] = useState<'left' | 'right' | null>(null);
  const [animatingCard, setAnimatingCard] = useState<string | null>(null);
  const { logActivity } = useSystemLogs();
  const navigate = useNavigate();
  
  const onSwiping = (direction: 'left' | 'right') => {
    setSwipingDirection(direction);
  };
  
  const onSwipe = async (direction: 'left' | 'right', card: ContentCard) => {
    setSwipingDirection(null);
    setAnimatingCard(card.id);
    
    // Short delay to ensure animation completes
    setTimeout(() => {
      setAnimatingCard(null);
      
      // Handle different card types
      switch (card.type) {
        case 'strategy':
          handleStrategySwipe(direction, card.id, navigate, logActivity);
          break;
        case 'campaign':
          handleCampaignSwipe(direction, card.id, navigate, logActivity);
          break;
        case 'pricing_decision':
        case 'hire_decision':
          handleDecisionSwipe(direction, card.id, card.type, logActivity);
          break;
        default:
          console.warn('Unknown card type:', card.type);
      }
    }, 300);
  };
  
  return {
    swipingDirection,
    animatingCard,
    onSwipe,
    onSwiping
  };
}
