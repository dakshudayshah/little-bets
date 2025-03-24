import { useEffect, useState } from 'react';
import '../styles/Toast.css';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

export const Toast = ({ message, type = 'info', duration = 3000, onClose }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`toast ${type} ${isVisible ? 'visible' : ''}`}>
      <p>{message}</p>
      <button onClick={() => setIsVisible(false)} className="toast-close">
        ×
      </button>
    </div>
  );
}; 