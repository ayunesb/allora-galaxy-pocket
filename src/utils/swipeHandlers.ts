
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export type ContentCard = {
  id: string;
  type: string;
  title?: string;
  name?: string;
  description: string;
  created_at: string;
  [key: string]: any; // For additional properties
};

export async function logSwipeActivity(
  contentId: string,
  contentType: string,
  action: 'approved' | 'dismissed',
  logActivity: (params: any) => Promise<void>
) {
  try {
    await logActivity({
      event_type: 'POCKET_SWIPE',
      message: `User ${action} a ${contentType}`,
      meta: { content_id: contentId, content_type: contentType, action }
    });
  } catch (error) {
    console.error('Error logging swipe:', error);
  }
}

export function handleStrategySwipe(
  direction: 'left' | 'right',
  cardId: string,
  navigate: ReturnType<typeof useNavigate>,
  logActivity: (params: any) => Promise<void>
) {
  const action = direction === 'right' ? 'approved' : 'dismissed';
  
  logSwipeActivity(cardId, 'strategy', action, logActivity);
  
  if (direction === 'right') {
    toast.success('Strategy approved!', {
      description: 'Creating campaign based on this strategy...'
    });
    
    setTimeout(() => {
      navigate(`/campaigns/create?strategy=${cardId}`);
    }, 1000);
  }
}

export function handleCampaignSwipe(
  direction: 'left' | 'right',
  cardId: string,
  navigate: ReturnType<typeof useNavigate>,
  logActivity: (params: any) => Promise<void>
) {
  const action = direction === 'right' ? 'approved' : 'dismissed';
  
  logSwipeActivity(cardId, 'campaign', action, logActivity);
  
  if (direction === 'right') {
    toast.success('Campaign liked!', {
      description: 'Viewed in campaigns dashboard'
    });
    
    setTimeout(() => {
      navigate(`/campaigns/${cardId}`);
    }, 1000);
  }
}

export function handleDecisionSwipe(
  direction: 'left' | 'right',
  cardId: string,
  decisionType: 'pricing_decision' | 'hire_decision',
  logActivity: (params: any) => Promise<void>
) {
  const action = direction === 'right' ? 'approved' : 'dismissed';
  
  logSwipeActivity(cardId, decisionType, action, logActivity);
  
  if (direction === 'right') {
    toast.success('Decision approved!', {
      description: 'Added to your action items'
    });
    // In a real app, you'd add this to an action items table
  }
}
