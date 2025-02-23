import { useEffect, useState, useRef } from 'react';
import { FloatingNotification } from './FloatingNotification';
import { Notification } from '../types/notifications';
import '../styles/FloatingNotification.css';

const EXAMPLE_BETS = [
  {
    title: "Social Media Stalker",
    question: "Will Priya's next Instagram post be a thirst trap or a humble brag?"
  },
  {
    title: "Relationship Roulette",
    question: "How long until Ashley drunkenly texts her ex again? (Over/Under: 2 weeks)"
  },
  {
    title: "Diet Disaster",
    question: "How many days will Uncle Joe last on his new fad diet before caving to pizza?"
  }
];

export const NotificationsContainer = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const indexRef = useRef(0);

  useEffect(() => {
    // Initial delay of 2 seconds
    const initialTimeout = setTimeout(() => {
      addNotification();
    }, 2000);

    return () => clearTimeout(initialTimeout);
  }, []);

  const addNotification = () => {
    const bet = EXAMPLE_BETS[indexRef.current % EXAMPLE_BETS.length];
    indexRef.current += 1;

    const newNotification: Notification = {
      id: Date.now(),
      title: bet.title,
      text: bet.question,
      isNew: true
    };

    setNotifications(prev => {
      if (prev.length === 0) return [newNotification];
      
      if (prev.length === 1) {
        return [newNotification, { ...prev[0], isNew: false }];
      }
      
      return [newNotification, prev[0]];
    });

    // Schedule next notification after 6 seconds (increased from 4)
    setTimeout(addNotification, 6000);
  };

  return (
    <div className="notifications-container">
      {notifications.map((notification, index) => (
        <FloatingNotification
          key={notification.id}
          {...notification}
          slot={index === 0 ? 'first' : 'second'}
        />
      ))}
    </div>
  );
}; 