
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/hooks/useTenant';
import { Strategy } from '@/types/strategy';
import { useToast } from './use-toast';

interface Card {
  id: string;
  type: 'strategy' | 'campaign' | 'pricing_decision' | 'hire_decision';
  title: string;
  description: string;
  created_at: string;
  metadata?: Record<string, any>;
}

export function usePocketFeed() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [viewedCount, setViewedCount] = useState(0);
  const [swiped, setSwiped] = useState<string[]>([]);
  const { tenant } = useTenant();
  const { toast } = useToast();

  const incrementViewedCount = () => {
    setViewedCount(prev => prev + 1);
  };

  const markCardSwiped = (cardId: string) => {
    setSwiped(prev => [...prev, cardId]);
  };

  useEffect(() => {
    const fetchCards = async () => {
      if (!tenant?.id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch strategies
        const { data: strategies, error: strategiesError } = await supabase
          .from('strategies')
          .select('*')
          .eq('tenant_id', tenant.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });
        
        if (strategiesError) throw strategiesError;
        
        // Fetch pending campaigns
        const { data: campaigns, error: campaignsError } = await supabase
          .from('campaigns')
          .select('*')
          .eq('tenant_id', tenant.id)
          .eq('status', 'draft')
          .order('created_at', { ascending: false });
          
        if (campaignsError) throw campaignsError;
        
        // Convert strategies to cards
        const strategyCards: Card[] = (strategies || []).map((strategy: any) => ({
          id: strategy.id,
          type: 'strategy',
          title: strategy.title || 'Untitled Strategy',
          description: strategy.description || 'No description available',
          created_at: strategy.created_at,
          metadata: {
            assigned_agent: strategy.assigned_agent,
            health_score: strategy.health_score,
            impact_score: strategy.impact_score,
          }
        }));
        
        // Convert campaigns to cards
        const campaignCards: Card[] = (campaigns || []).map((campaign: any) => ({
          id: campaign.id,
          type: 'campaign',
          title: campaign.name || 'Untitled Campaign',
          description: campaign.description || 'No description available',
          created_at: campaign.created_at,
          metadata: {
            status: campaign.status,
            execution_status: campaign.execution_status,
          }
        }));
        
        // Combine all cards and sort by created_at
        const allCards = [...strategyCards, ...campaignCards]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        
        setCards(allCards);
      } catch (err) {
        console.error('Error fetching pocket feed:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch pocket feed'));
        toast({
          title: "Error loading content",
          description: err instanceof Error ? err.message : "Failed to load content",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCards();
  }, [tenant?.id, toast]);
  
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
