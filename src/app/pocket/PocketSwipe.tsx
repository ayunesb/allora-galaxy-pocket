
import React from 'react';
import { usePocketFeed } from '@/hooks/usePocketFeed';
import { useSwipeGestures } from './hooks/useSwipeGestures';
import EmptyState from './components/EmptyState';
import SwipeCardStack from './components/SwipeCardStack';
import SwipeControls from './components/SwipeControls';

const PocketSwipe = () => {
  const { 
    cards, 
    loading, 
    error, 
    viewedCount, 
    swiped,
    incrementViewedCount,
    markCardSwiped
  } = usePocketFeed();
  
  const {
    swipingDirection,
    animatingCard,
    onSwipe,
    onSwiping
  } = useSwipeGestures();
  
  // Handle swipe from UI controls
  const handleControlSwipe = (direction: 'left' | 'right') => {
    if (activeCards.length > 0) {
      onSwipe(direction, activeCards[0]);
      markCardSwiped(activeCards[0].id);
      incrementViewedCount();
    }
  };
  
  // Handle swipe from card gesture
  const handleCardSwipe = (direction: 'left' | 'right', card: any) => {
    onSwipe(direction, card);
    markCardSwiped(card.id);
    incrementViewedCount();
  };
  
  if (loading) {
    return <EmptyState type="loading" />;
  }

  if (error) {
    return <EmptyState type="error" error={error} />;
  }
  
  // Filter out cards that have already been swiped
  const activeCards = cards.filter(card => !swiped.includes(card.id));
  
  if (activeCards.length === 0) {
    return <EmptyState type="empty" />;
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <SwipeCardStack 
        activeCards={activeCards}
        animatingCard={animatingCard}
        swipingDirection={swipingDirection}
        onSwipe={handleCardSwipe}
        onSwiping={onSwiping}
      />
      
      <SwipeControls 
        onSwipe={handleControlSwipe}
        viewedCount={viewedCount}
        hasActiveCards={activeCards.length > 0}
      />
    </div>
  );
};

export default PocketSwipe;
