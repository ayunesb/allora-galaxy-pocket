import { FeedbackEntry } from '../types/feedback';

export function useFeedback(): FeedbackEntry[] {
  return [
    {
      feature: 'AI Strategy Generator',
      comment: 'It nailed my Q2 goals. Super helpful!',
      rating: 5,
      timestamp: '2025-04-18 10:02:00',
    },
    {
      feature: 'Plugin Installer',
      comment: 'I wish I could sort by popularity.',
      rating: 3,
      timestamp: '2025-04-21 15:33:00',
    }
  ];
}
