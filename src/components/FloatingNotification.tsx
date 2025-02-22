import { useState, useEffect } from 'react';
import '../styles/FloatingNotification.css';

interface FloatingNotificationProps {
  text: string;
  position: {
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
  };
  delay?: number;
}

export const FloatingNotification = ({ text, position, delay = 0 }: FloatingNotificationProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`floating-notification ${isVisible ? 'visible' : ''}`}
      style={{
        ...position,
        animationDelay: `${delay}ms`
      }}
    >
      <div className="notification-content">
        {text}
      </div>
    </div>
  );
}; 