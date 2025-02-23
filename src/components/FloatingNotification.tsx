import { memo } from 'react';
import { NotificationPosition } from '../types/notifications';
import '../styles/FloatingNotification.css';

// Be explicit about which props we want
interface FloatingNotificationProps {
  id: number;
  title: string;
  text: string;
  position: NotificationPosition;
  opacity: number;
  floatOffset: number;
}

export const FloatingNotification = memo(({ 
  title,
  text, 
  position
}: FloatingNotificationProps) => {
  return (
    <div 
      className={`floating-notification notification-${position}`}
      role="alert"
      aria-live="polite"
    >
      <div className="notification-inner">
        <div className="notification-body">
          <div className="notification-title">{title}</div>
          <div className="notification-text">{text}</div>
        </div>
      </div>
    </div>
  );
});

FloatingNotification.displayName = 'FloatingNotification'; 