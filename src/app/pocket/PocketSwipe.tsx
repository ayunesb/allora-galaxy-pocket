
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { useSystemLogs } from '@/hooks/useSystemLogs';
import TinderCard from 'react-tinder-card';
import { toast } from 'sonner';
import { usePocketFeed } from '@/hooks/usePocketFeed';
import { 
  handleStrategySwipe, 
  handleCampaignSwipe, 
  handleDecisionSwipe,
  ContentCard
} from '@/utils/swipeHandlers';
import SwipeCard from './SwipeCard';

const PocketSwipe = () => {
  const [swipingDirection, setSwipingDirection] = useState<'left' | 'right' | null>(null);
  const [animatingCard, setAnimatingCard] = useState<string | null>(null);
  
  const { 
    cards, 
    loading, 
    error, 
    viewedCount, 
    swiped,
    incrementViewedCount,
    markCardSwiped
  } = usePocketFeed();
  
  const { logActivity } = useSystemLogs();
  const navigate = useNavigate();
  
  const onSwipe = async (direction: 'left' | 'right', card: ContentCard) => {
    setSwipingDirection(null);
    setAnimatingCard(card.id);
    
    // Short delay to ensure animation completes
    setTimeout(() => {
      markCardSwiped(card.id);
      incrementViewedCount();
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
  
  const onSwiping = (direction: 'left' | 'right') => {
    setSwipingDirection(direction);
  };
  
  const getCardTitle = (card: ContentCard) => {
    if (card.title) return card.title;
    if (card.name) return card.name;
    
    // Default titles based on type
    switch(card.type) {
      case 'strategy': return 'Marketing Strategy';
      case 'campaign': return 'Marketing Campaign';
      case 'pricing_decision': return 'Pricing Decision';
      case 'hire_decision': return 'Hiring Recommendation';
      default: return 'Recommendation';
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading recommendations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <Card className="relative overflow-hidden shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="text-5xl mb-6">🙁</div>
            <h2 className="text-2xl font-bold mb-4">Oops! Something went wrong</h2>
            <p className="mb-6 text-gray-600">
              We couldn't load your recommendations. Please try again later.
            </p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (cards.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <Card className="relative overflow-hidden shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="text-5xl mb-6">🎉</div>
            <h2 className="text-2xl font-bold mb-4">You're All Caught Up!</h2>
            <p className="mb-6 text-gray-600">
              You've viewed all available recommendations. Check back later for more!
            </p>
            <Button onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Filter out cards that have already been swiped
  const activeCards = cards.filter(card => !swiped.includes(card.id));
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <div className="relative h-[500px]">
        {activeCards.map((card, index) => {
          const isTopCard = index === 0;
          const isAnimating = animatingCard === card.id;
          
          return (
            <div key={card.id} className="absolute inset-0">
              <TinderCard
                onSwipe={(dir) => isTopCard && onSwipe(dir as 'left' | 'right', card)}
                onSwipeRequirementFulfilled={(dir) => isTopCard && onSwiping(dir as 'left' | 'right')}
                preventSwipe={['up', 'down']}
                swipeRequirementType="position"
                swipeThreshold={80}
              >
                <div className="relative h-full">
                  <SwipeCard
                    title={getCardTitle(card)}
                    summary={card.description}
                    type={card.type as 'strategy' | 'campaign' | 'pricing' | 'hire'}
                    metadata={{
                      created_at: card.created_at,
                      industry: card.industry,
                      budget: card.budget,
                      suggestedPrice: card.suggested_price,
                      currentPrice: card.current_price,
                      salary_range: card.salary_range
                    }}
                    isActive={isTopCard}
                    position={index}
                    animating={isAnimating}
                  />
                  
                  {isTopCard && (
                    <div 
                      className={`absolute inset-0 ${
                        swipingDirection === 'right' ? 'bg-green-100/80' : 
                        swipingDirection === 'left' ? 'bg-red-100/80' : 
                        'bg-transparent'
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
                  )}
                </div>
              </TinderCard>
            </div>
          );
        })}
      </div>
      
      {activeCards.length > 0 && (
        <div className="mt-6 flex justify-between items-center">
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full h-12 w-12 bg-red-50 hover:bg-red-100 border-red-200"
            onClick={() => activeCards.length > 0 && onSwipe('left', activeCards[0])}
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
            onClick={() => activeCards.length > 0 && onSwipe('right', activeCards[0])}
          >
            <Check className="h-6 w-6 text-green-500" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default PocketSwipe;
