
import React from 'react';
import { 
  LineChart, 
  ClipboardCheck, 
  DollarSign, 
  UserPlus
} from 'lucide-react';

interface CardIconProps {
  type: 'strategy' | 'campaign' | 'pricing' | 'hire';
}

const CardIcon: React.FC<CardIconProps> = ({ type }) => {
  switch (type) {
    case 'strategy':
      return <LineChart className="h-5 w-5" />;
    case 'campaign':
      return <ClipboardCheck className="h-5 w-5" />;
    case 'pricing':
      return <DollarSign className="h-5 w-5" />;
    case 'hire':
      return <UserPlus className="h-5 w-5" />;
    default:
      return <LineChart className="h-5 w-5" />;
  }
};

export default CardIcon;
