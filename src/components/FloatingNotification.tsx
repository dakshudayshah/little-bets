import '../styles/FloatingNotification.css';

type NotificationStatus = 'entering' | 'visible' | 'exiting';

interface FloatingNotificationProps {
  text: string;
  position: {
    top: string;
    right: string;
  };
  status: NotificationStatus;
}

export const FloatingNotification = ({ 
  text, 
  position, 
  status
}: FloatingNotificationProps) => {
  return (
    <div 
      className={`floating-notification ${status}`}
      style={position}
    >
      <div className="notification-content">
        {text}
      </div>
    </div>
  );
}; 