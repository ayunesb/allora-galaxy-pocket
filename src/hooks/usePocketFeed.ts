
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/hooks/useTenant';
import { useSystemLogs } from '@/hooks/useSystemLogs';
import { ContentCard } from '@/utils/swipeHandlers';
import { toast } from 'sonner';
import { Strategy } from '@/types/strategy';
import { Campaign } from '@/types/campaign';
import { transformStrategyArray } from '@/utils/dataTransformers';

export function usePocketFeed() {
  const [cards, setCards] = useState<ContentCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [viewedCount, setViewedCount] = useState(0);
  const [swiped, setSwiped] = useState<string[]>([]);
  
  const { tenant } = useTenant();
  const { logActivity } = useSystemLogs();
  
  // Fetch different content types
  useEffect(() => {
    if (!tenant?.id) return;
    
    async function fetchContent() {
      setLoading(true);
      setError(null);
      
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
        const formattedStrategies = transformToContentCards(strategies as Strategy[], 'strategy');
        
        // Format campaigns
        const formattedCampaigns = transformToContentCards(campaigns as Campaign[], 'campaign');
        
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
        setError(error instanceof Error ? error : new Error('Failed to load content'));
        toast.error('Failed to load content');
      } finally {
        setLoading(false);
      }
    }
    
    fetchContent();
  }, [tenant?.id, logActivity]);

  const transformToContentCards = (items: any[], type: string): ContentCard[] => {
    if (!items || !Array.isArray(items)) return [];
    
    return items.map(item => ({
      id: item.id,
      type,
      title: type === 'strategy' ? item.title : undefined,
      name: type === 'campaign' ? item.name : undefined,
      description: item.description || 'No description provided.',
      created_at: item.created_at,
      // Include any additional data from the original item
      ...item
    }));
  };
  
  const incrementViewedCount = () => {
    setViewedCount(prev => prev + 1);
  };
  
  const markCardSwiped = (cardId: string) => {
    setSwiped(prev => [...prev, cardId]);
  };
  
  return {
    cards,
    loading,
    error,
    viewedCount,
    swiped,
    incrementViewedCount,
    markCardSwiped
  };
}
