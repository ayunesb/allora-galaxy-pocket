import { AgentStat } from '../types/agentStats';

export function useAgentStats(): AgentStat[] {
  return [
    { name: 'CEO_Agent', xp: 72, winRate: '88%' },
    { name: 'GrowthHacker_Agent', xp: 45, winRate: '64%' },
    { name: 'CampaignBot_Agent', xp: 56, winRate: '77%' },
  ];
}