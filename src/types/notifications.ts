export type NotificationPosition = 'entering' | 'first' | 'second' | 'exiting';

export interface Notification {
  id: number;
  title: string;
  text: string;
  isNew: boolean;
} 