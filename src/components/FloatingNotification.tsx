import { useState, useEffect } from 'react';
import '../styles/FloatingNotification.css';

export interface FloatingNotificationProps {
  title: string;
  message: string; // Changed from 'content' to 'message' to match usage in NotificationsContainer
}

export const FloatingNotification = ({ title, message }: FloatingNotificationProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`floating-notification ${isVisible ? 'visible' : ''}`}>
      <div className="notification-title">{title}</div>
      <div className="notification-content">{message}</div>
    </div>
  );
}; 