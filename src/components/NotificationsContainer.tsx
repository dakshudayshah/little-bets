import { useEffect, useState, useRef } from 'react';
import { FloatingNotification } from './FloatingNotification';
import { Notification, NotificationPosition } from '../types/notifications';
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
  const isMounted = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const indexRef = useRef(0);

  useEffect(() => {
    const addNotification = () => {
      const bet = EXAMPLE_BETS[indexRef.current % EXAMPLE_BETS.length];
      const newNotification: Notification = {
        id: Date.now(),
        title: bet.title,
        text: bet.question,
        position: 'entering',
        opacity: 1,
        floatOffset: 0
      };

      setNotifications(prev => {
        const updated = prev.map(n => ({
          ...n,
          position: getNextPosition(n.position)
        }));
        return [...updated, newNotification].slice(-3);
      });

      indexRef.current += 1;
      scheduleNextNotification();
    };

    const scheduleNextNotification = () => {
      timeoutRef.current = setTimeout(addNotification, 3000);
    };

    scheduleNextNotification();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      isMounted.current = false;
    };
  }, []);

  return (
    <div 
      className="notifications-container"
      role="log"
      aria-live="polite"
    >
      {notifications.map(notification => (
        <FloatingNotification
          key={notification.id}
          {...notification}
        />
      ))}
    </div>
  );
};

const getNextPosition = (current: NotificationPosition): NotificationPosition => {
  switch (current) {
    case 'entering': return 'first';
    case 'first': return 'second';
    case 'second': return 'exiting';
    default: return 'exiting';
  }
}; 