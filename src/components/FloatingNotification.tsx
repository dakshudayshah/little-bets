import { useState, useEffect } from 'react';
import '../styles/FloatingNotification.css';

interface FloatingNotificationProps {
  text: string;
  position: {
    top: string;
    right: string;
  };
  status: 'entering' | 'visible' | 'exiting';
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