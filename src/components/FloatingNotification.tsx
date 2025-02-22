import '../styles/FloatingNotification.css';

type NotificationStatus = 'entering' | 'visible' | 'exiting';

interface FloatingNotificationProps {
  text: string;
  position: {
    top: string;
    right: string;
  };
  status: NotificationStatus;
  index: number;
}

export const FloatingNotification = ({ 
  text, 
  position, 
  status,
  index 
}: FloatingNotificationProps) => {
  console.log('Rendering notification:', { status, index });
  
  return (
    <div 
      className={`floating-notification ${status}`}
      style={{
        ...position,
        transform: `translateY(${index * 80}px)`
      }}
    >
      <div className="notification-content">
        {text}
      </div>
    </div>
  );
}; 