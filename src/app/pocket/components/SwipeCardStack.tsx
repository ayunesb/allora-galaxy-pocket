
import React from 'react';
import TinderCard from 'react-tinder-card';
import SwipeCard from '@/app/pocket/SwipeCard';
import SwipeOverlay from './SwipeOverlay';
import { ContentCard } from '@/utils/swipeHandlers';

interface SwipeCardStackProps {
  activeCards: ContentCard[];
  animatingCard: string | null;
  swipingDirection: 'left' | 'right' | null;
  onSwipe: (direction: 'left' | 'right', card: ContentCard) => void;
  onSwiping: (direction: 'left' | 'right') => void;
}

const SwipeCardStack = ({ 
  activeCards, 
  animatingCard, 
  swipingDirection, 
  onSwipe, 
  onSwiping 
}: SwipeCardStackProps) => {
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

  return (
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
                
                {isTopCard && <SwipeOverlay swipingDirection={swipingDirection} />}
              </div>
            </TinderCard>
          </div>
        );
      })}
    </div>
  );
};

export default SwipeCardStack;
