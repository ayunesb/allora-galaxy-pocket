import { StrategyRecommendation } from '../types/recommendation';

export function useStrategyRecommendations(): StrategyRecommendation[] {
  return [
    {
      title: 'Q3 Growth Sprint',
      description: 'Double down on paid acquisition and partner-led webinars.',
      actions: ['Increase paid ad budget by 20%', 'Host 2 partner webinars'],
      score: '92%'
    },
    {
      title: 'User Retention Revamp',
      description: 'Improve onboarding and incentivize early actions.',
      actions: ['Create 3-step email onboarding', 'Offer milestone-based rewards'],
      score: '88%'
    }
  ];
}
