import { SystemLog } from '../types/systemLog';

export function useSystemHealth(): SystemLog[] {
  return [
    { message: 'Supabase connection established.', level: 'info', timestamp: '2025-04-29 12:00:00' },
    { message: 'Plugin registry synced.', level: 'info', timestamp: '2025-04-29 12:10:00' },
    { message: 'Campaign execution failed: timeout.', level: 'error', timestamp: '2025-04-29 12:15:00' },
    { message: 'Agent XP update completed.', level: 'info', timestamp: '2025-04-29 12:20:00' }
  ];
}
