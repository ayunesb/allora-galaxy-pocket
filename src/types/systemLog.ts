export interface SystemLog {
  message: string;
  level: 'info' | 'error';
  timestamp: string;
}
