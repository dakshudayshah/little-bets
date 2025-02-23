import { memo } from 'react';
import { Notification } from '../types/notifications';
import '../styles/FloatingNotification.css';

interface FloatingNotificationProps extends Notification {
  slot: 'first' | 'second';
}

export const FloatingNotification = memo(({ 
  title,
  text,
  slot,
  isNew
}: FloatingNotificationProps) => {
  return (
    <div className={`notification ${slot} ${isNew ? 'new' : ''}`}>
      <div className="notification-title">{title}</div>
      <div className="notification-text">{text}</div>
    </div>
  );
});

FloatingNotification.displayName = 'FloatingNotification'; 