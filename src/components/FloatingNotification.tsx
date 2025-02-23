import { memo } from 'react';
import { NotificationPosition, NotificationSlotConfig, Notification } from '../types/notifications';
import '../styles/FloatingNotification.css';

// Be explicit about which props we want
interface FloatingNotificationProps {
  id: number;
  text: string;
  position: NotificationPosition;
  floatOffset: number;
  config: NotificationSlotConfig;
}

export const FloatingNotification = memo(({ 
  text, 
  position,
  config 
}: FloatingNotificationProps) => {
  return (
    <div 
      className={`floating-notification notification-${position}`}
      style={{
        top: config.top,
        right: config.right,
        opacity: config.opacity,
        transform: `scale(${config.scale})`
      }}
      role="alert"
      aria-live="polite"
    >
      <div className="notification-inner">
        <div className="notification-body">
          <div className="notification-content">
            {text}
          </div>
        </div>
      </div>
    </div>
  );
});

FloatingNotification.displayName = 'FloatingNotification'; 