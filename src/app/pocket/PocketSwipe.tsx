import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/hooks/useTenant';
import { useSystemLogs } from '@/hooks/useSystemLogs';
import TinderCard from 'react-tinder-card';
import { toast } from 'sonner';

// Define a type for the content cards
type ContentCard = {
  id: string;
  type: string;
  title?: string;
  name?: string; // For campaigns
  description: string;
  created_at: string;
};

const PocketSwipe = () => {
  const [cards, setCards] = useState<ContentCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewedCount, setViewedCount] = useState(0);
  const [swiped, setSwiped] = useState<string[]>([]);
  const [swipingDirection, setSwipingDirection] = useState<'left' | 'right' | null>(null);
  
  const { user } = useAuth();
  const { tenant } = useTenant();
  const { logActivity } = useSystemLogs();
  const navigate = useNavigate();
  
  // Fetch different content types
  useEffect(() => {
    if (!tenant?.id) return;
    
    async function fetchContent() {
      setLoading(true);
      try {
        // Get strategies
        const { data: strategies, error: stratError } = await supabase
          .from('strategies')
          .select('*')
          .eq('tenant_id', tenant.id)
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (stratError) throw stratError;
        
        // Get campaigns
        const { data: campaigns, error: campError } = await supabase
          .from('campaigns')
          .select('*')
          .eq('tenant_id', tenant.id)
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (campError) throw campError;
        
        // Mock data for pricing decisions and hire decisions
        // In a real app, these would come from their respective tables
        const pricingDecisions = [
          {
            id: 'price-1',
            type: 'pricing_decision',
            title: 'Premium Plan Price Adjustment',
            description: 'Increase premium plan price by 10% based on competitor analysis and feature additions.',
            created_at: new Date().toISOString()
          },
          {
            id: 'price-2',
            type: 'pricing_decision',
            title: 'Volume Discount Strategy',
            description: 'Implement tiered volume discounts for enterprise clients to incentivize larger contracts.',
            created_at: new Date().toISOString()
          }
        ];
        
        const hireDecisions = [
          {
            id: 'hire-1',
            type: 'hire_decision',
            title: 'Marketing Specialist',
            description: 'Hire a growth marketing specialist to focus on acquisition channels and SEO optimization.',
            created_at: new Date().toISOString()
          }
        ];
        
        // Format strategies
        const formattedStrategies = strategies?.map(s => ({
          id: s.id,
          type: 'strategy',
          title: s.title || 'Untitled Strategy',
          description: s.description || 'No description provided.',
          created_at: s.created_at
        })) || [];
        
        // Format campaigns
        const formattedCampaigns = campaigns?.map(c => ({
          id: c.id,
          type: 'campaign',
          name: c.name,
          description: c.description || 'No description provided.',
          created_at: c.created_at
        })) || [];
        
        // Combine all content types and shuffle
        const allContent = [
          ...formattedStrategies, 
          ...formattedCampaigns,
          ...pricingDecisions,
          ...hireDecisions
        ].sort(() => Math.random() - 0.5);
        
        setCards(allContent);
        
        // Log the activity
        await logActivity({
          event_type: 'POCKET_VIEW',
          message: 'User viewed pocket swipe content',
          meta: { content_count: allContent.length }
        });
      } catch (error) {
        console.error('Error fetching pocket content:', error);
        toast.error('Failed to load content');
      } finally {
        setLoading(false);
      }
    }
    
    fetchContent();
  }, [tenant?.id, logActivity]);
  
  const onSwipe = async (direction: 'left' | 'right', cardId: string, cardType: string) => {
    setSwipingDirection(null);
    setSwiped(prev => [...prev, cardId]);
    setViewedCount(prev => prev + 1);
    
    const action = direction === 'right' ? 'approved' : 'dismissed';
    
    try {
      // Log the swipe action
      await logActivity({
        event_type: 'POCKET_SWIPE',
        message: `User ${action} a ${cardType}`,
        meta: { content_id: cardId, content_type: cardType, action }
      });
      
      // Handle different card types
      if (cardType === 'strategy' && direction === 'right') {
        toast.success('Strategy approved!', {
          description: 'Creating campaign based on this strategy...'
        });
        // Navigate to campaign creation with this strategy
        // In a real app, you might want to add some delay before navigation
        setTimeout(() => {
          navigate(`/campaigns/create?strategy=${cardId}`);
        }, 1000);
      }
      
      if (cardType === 'campaign' && direction === 'right') {
        toast.success('Campaign liked!', {
          description: 'Viewed in campaigns dashboard'
        });
        // Navigate to the campaign detail
        setTimeout(() => {
          navigate(`/campaigns/${cardId}`);
        }, 1000);
      }
      
      // Handle pricing and hiring decisions
      if ((cardType === 'pricing_decision' || cardType === 'hire_decision') && direction === 'right') {
        toast.success('Decision approved!', {
          description: 'Added to your action items'
        });
        // In a real app, you'd add this to an action items table
      }
      
    } catch (error) {
      console.error('Error logging swipe:', error);
    }
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
  
  const getCardEmoji = (cardType: string) => {
    switch(cardType) {
      case 'strategy': return '📊';
      case 'campaign': return '📣';
      case 'pricing_decision': return '💰';
      case 'hire_decision': return '👥';
      default: return '💡';
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
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <div className="relative h-[500px]">
        {cards.map((card, index) => (
          <TinderCard
            key={card.id}
            onSwipe={(dir) => onSwipe(dir as 'left' | 'right', card.id, card.type)}
            onSwipeRequirementFulfilled={(dir) => onSwiping(dir as 'left' | 'right')}
            preventSwipe={['up', 'down']}
            className={`absolute w-full h-full ${index === cards.length - 1 ? 'z-10' : ''}`}
          >
            <Card className="relative overflow-hidden shadow-lg h-full">
              <div 
                className={`absolute inset-0 ${
                  swipingDirection === 'right' ? 'bg-green-100/80' : 
                  swipingDirection === 'left' ? 'bg-red-100/80' : 
                  'bg-transparent'
                } transition-colors duration-200 z-10 pointer-events-none`}
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
              
              <CardContent className="p-6 h-full flex flex-col">
                <div className="mb-4">
                  <span className="inline-block bg-primary/10 rounded-full px-3 py-1 text-sm font-semibold text-primary mr-2">
                    {getCardEmoji(card.type)} {card.type.charAt(0).toUpperCase() + card.type.slice(1)}
                  </span>
                </div>
                
                <h2 className="text-2xl font-bold mb-3">{getCardTitle(card)}</h2>
                <p className="text-gray-600 flex-grow">{card.description}</p>
                
                <div className="mt-6 pt-4 border-t border-gray-200 text-sm text-gray-500">
                  {new Date(card.created_at).toLocaleDateString()}
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full h-12 w-12 bg-red-50 hover:bg-red-100 border-red-200"
                    onClick={() => onSwipe('left', card.id, card.type)}
                  >
                    <X className="h-6 w-6 text-red-500" />
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full h-12 w-12 bg-green-50 hover:bg-green-100 border-green-200"
                    onClick={() => onSwipe('right', card.id, card.type)}
                  >
                    <Check className="h-6 w-6 text-green-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TinderCard>
        ))}
      </div>
      
      <div className="text-center mt-6 text-sm text-gray-500">
        {viewedCount > 0 ? `You've viewed ${viewedCount} recommendations` : 'Swipe right to approve, left to dismiss'}
      </div>
    </div>
  );
};

export default PocketSwipe;
