export type NotificationPosition = 'entering' | 'first' | 'second' | 'exiting';

export interface Notification {
  id: number;
  text: string;
  position: NotificationPosition;
  opacity: number;
  floatOffset: number;
}

export interface NotificationSlotConfig {
  top: string;
  right: string;
  opacity: number;
  scale: number;
}

// Configuration for each position
export const NOTIFICATION_SLOTS: Record<NotificationPosition, NotificationSlotConfig> = {
  entering: {
    top: '80px',
    right: '20px',
    opacity: 0,
    scale: 0.95
  },
  first: {
    top: '80px',
    right: '20px',
    opacity: 1,
    scale: 1
  },
  second: {
    top: '160px',
    right: '20px',
    opacity: 0.8,
    scale: 0.98
  },
  exiting: {
    top: '240px',
    right: '20px',
    opacity: 0,
    scale: 0.94
  }
}; 