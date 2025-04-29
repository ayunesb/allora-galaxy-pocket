import { Strategy } from '../types/strategy';

export function useStrategies(): Strategy[] {
  return [
    {
      title: 'Launch Strategy Q2',
      summary: 'Focus on acquiring leads through webinars and partnerships.',
      goals: ['Host 4 webinars', 'Sign 2 new partners', 'Collect 500 leads'],
      generatedAt: '2025-03-18T10:00:00Z'
    },
    {
      title: 'Retention Campaign',
      summary: 'Increase engagement from existing users.',
      goals: ['Launch NPS survey', 'Implement loyalty rewards', 'Improve onboarding'],
      generatedAt: '2025-02-01T15:30:00Z'
    }
  ];
}
