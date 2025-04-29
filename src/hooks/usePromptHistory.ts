import { PromptLog } from '../types/promptLog';

export function usePromptHistory(): PromptLog[] {
  return [
    {
      prompt: 'Generate a strategy for increasing MRR in Q2',
      response: 'Focus on webinars, lead magnets, and partner bundles.',
      timestamp: '2025-04-15 09:00:00',
    },
    {
      prompt: 'Create a cold outreach campaign for e-commerce founders',
      response: 'Use value-first messaging with incentives and urgency.',
      timestamp: '2025-04-16 14:35:00',
    }
  ];
}
