import { useState, useEffect } from 'react';
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
  return (
    <div 
      className={`floating-notification ${status}`}
      style={{
        ...position,
        transform: `translateY(${index * 80}px)`  // Stack notifications vertically
      }}
    >
      <div className="notification-content">
        {text}
      </div>
    </div>
  );
}; 