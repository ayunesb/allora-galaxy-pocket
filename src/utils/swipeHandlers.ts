
import { NavigateFunction } from 'react-router-dom';

export interface ContentCard {
  id: string;
  type: string;
  title?: string;
  name?: string;
  description?: string;
  created_at?: string;
  industry?: string;
  budget?: number;
  suggested_price?: string;
  current_price?: string;
  salary_range?: string;
}

// Type for logActivity function
export type LogActivityFunction = (params: any) => Promise<void>;

export function handleStrategySwipe(
  direction: 'left' | 'right', 
  strategyId: string, 
  navigate: NavigateFunction,
  logActivity: LogActivityFunction
) {
  if (direction === 'right') {
    // Accept strategy
    navigate(`/strategy/${strategyId}`);
    logActivity({
      event_type: 'STRATEGY_SWIPED',
      message: `Strategy ${strategyId} approved by swipe`,
      meta: { strategy_id: strategyId, action: 'approve' }
    });
  } else {
    // Reject strategy
    logActivity({
      event_type: 'STRATEGY_SWIPED',
      message: `Strategy ${strategyId} rejected by swipe`,
      meta: { strategy_id: strategyId, action: 'reject' }
    });
  }
}

export function handleCampaignSwipe(
  direction: 'left' | 'right', 
  campaignId: string, 
  navigate: NavigateFunction,
  logActivity: LogActivityFunction
) {
  if (direction === 'right') {
    // View campaign
    navigate(`/campaigns/${campaignId}`);
    logActivity({
      event_type: 'CAMPAIGN_SWIPED',
      message: `Campaign ${campaignId} viewed by swipe`,
      meta: { campaign_id: campaignId, action: 'view' }
    });
  } else {
    // Skip campaign
    logActivity({
      event_type: 'CAMPAIGN_SWIPED',
      message: `Campaign ${campaignId} skipped by swipe`,
      meta: { campaign_id: campaignId, action: 'skip' }
    });
  }
}

export function handleDecisionSwipe(
  direction: 'left' | 'right', 
  decisionId: string, 
  decisionType: string,
  logActivity: LogActivityFunction
) {
  if (direction === 'right') {
    // Accept decision
    logActivity({
      event_type: 'DECISION_SWIPED',
      message: `${decisionType} decision ${decisionId} approved by swipe`,
      meta: { decision_id: decisionId, decision_type: decisionType, action: 'approve' }
    });
  } else {
    // Reject decision
    logActivity({
      event_type: 'DECISION_SWIPED',
      message: `${decisionType} decision ${decisionId} rejected by swipe`,
      meta: { decision_id: decisionId, decision_type: decisionType, action: 'reject' }
    });
  }
}
