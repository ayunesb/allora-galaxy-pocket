
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { motion } from 'framer-motion';
import CardTypeBadge from './components/CardTypeBadge';
import CardMetadata from './components/CardMetadata';

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

  const onCardMount = (node: HTMLDivElement) => {
    if (node && !cardHeight) {
      setCardHeight(node.getBoundingClientRect().height);
    }
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
            <CardTypeBadge type={type} />
          </div>
        </CardHeader>
        
        <CardContent>
          <p className="text-muted-foreground">{summary || 'No description provided'}</p>
        </CardContent>
        
        <CardMetadata type={type} metadata={metadata} />
      </Card>
    </motion.div>
  );
};

export default SwipeCard;
