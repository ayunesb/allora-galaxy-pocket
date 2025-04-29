import { MarketPlugin } from '../types/marketPlugin';

export function useAvailablePlugins(): MarketPlugin[] {
  return [
    {
      name: 'KPI Sync Engine',
      description: 'Syncs campaign KPIs and alerts.',
      version: '1.0.0',
    },
    {
      name: 'Agent Activity Logger',
      description: 'Tracks agent decisions, XP and strategy iterations.',
      version: '1.1.1',
    },
    {
      name: 'Email Sequence Generator',
      description: 'Creates AI-based outbound campaigns for cold leads.',
      version: '2.0.0',
    },
  ];
}
