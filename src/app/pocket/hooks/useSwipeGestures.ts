
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSystemLogs } from '@/hooks/useSystemLogs';
import { 
  handleStrategySwipe, 
  handleCampaignSwipe, 
  handleDecisionSwipe,
  ContentCard 
} from '@/utils/swipeHandlers';
import { swipeHapticFeedback } from '@/utils/hapticFeedback';

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
    
    // Trigger haptic feedback based on swipe direction
    swipeHapticFeedback(direction);
    
    // Short delay to ensure animation completes
    setTimeout(() => {
      setAnimatingCard(null);
      
      // Handle different card types
      switch (card.type) {
        case 'strategy':
          // Convert logActivity to async function call with proper parameters
          handleStrategySwipe(direction, card.id, navigate, async (params) => {
            await logActivity(
              params.event_type || 'strategy_swipe',
              params.message || `Strategy ${direction} swipe`,
              params.meta || { strategy_id: card.id, direction },
              params.severity || 'info'
            );
            return Promise.resolve();
          });
          break;
        case 'campaign':
          handleCampaignSwipe(direction, card.id, navigate, async (params) => {
            await logActivity(
              params.event_type || 'campaign_swipe', 
              params.message || `Campaign ${direction} swipe`,
              params.meta || { campaign_id: card.id, direction },
              params.severity || 'info'
            );
            return Promise.resolve();
          });
          break;
        case 'pricing_decision':
        case 'hire_decision':
          handleDecisionSwipe(direction, card.id, card.type, async (params) => {
            await logActivity(
              params.event_type || 'decision_swipe',
              params.message || `Decision ${direction} swipe`,
              params.meta || { decision_id: card.id, decision_type: card.type, direction },
              params.severity || 'info'
            );
            return Promise.resolve();
          });
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
