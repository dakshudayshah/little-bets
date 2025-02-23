import { useEffect, useState, useCallback, useRef } from 'react';
import { FloatingNotification } from './FloatingNotification';
import { Notification, NotificationPosition, NOTIFICATION_SLOTS } from '../types/notifications';
import '../styles/FloatingNotification.css';

const EXAMPLE_BETS = [
  "Relationship Roulette: How long until Ashley drunkenly texts her ex again? (Over/Under: 2 weeks)",
  "Social Media Stalker: Will Priya's next Instagram post be a thirst trap or a humble brag?",
  "Diet Disaster: How many days will Uncle Joe last on his new fad diet before caving to pizza?",
  "Job Jump Scare: Will Kevin quit his job in a dramatic fashion or just quietly slip out?",
  "Dating App Debacle: How many dates will Neha go on before declaring 'dating is dead'?",
  "Home Renovation Horror: Will Aunt Susan's DIY project end in Pinterest-worthy success or a call to a professional?",
  "Fashion Faux Pas: Will Rajeev wear socks with sandals in public this year?",
  "Cooking Catastrophe: Will David's attempt at a 'simple' recipe result in edible food or a kitchen fire drill?",
  "Travel Trouble: On Meena's next vacation: lost luggage or public argument with travel buddy?",
  "Tech Tantrum: How long until Grandpa Bob throws his phone in frustration?",
  "Gift Giving Gaffe: Will Emily re-gift something she received last year?",
  "Parking Predicament: How many attempts for Chris to parallel park?",
  "Karaoke Calamity: Will Anika's next karaoke performance be cringe or comedy gold?",
  "Plant Parenthood: How long until Michael's new houseplant dies?",
  "Fitness Fail: Will Pooja use her gym membership more than 5 times this month?",
  "Bookworm Betrayal: Will Uncle Tom finish that 'life-changing' book?",
  "Punctuality Predicament: How late will Jessica be to the next family gathering?",
  "Road Trip Ruckus: Who'll get hangry first: Sarah or Vikram?",
  "Movie Marathon Meltdown: Who'll fall asleep first: Aunt Carol or Cousin Ravi?",
  "I Told You So: Will Aunt Patricia's questionable decision backfire within 6 months?"
];

export const NotificationsContainer = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  // Memoize position transition logic
  const moveToNextPosition = useCallback((position: NotificationPosition): NotificationPosition => {
    switch (position) {
      case 'entering': return 'first';
      case 'first': return 'second';
      case 'second': return 'third';
      case 'third': return 'exiting';
      default: return 'exiting';
    }
  }, []);

  const addNotification = useCallback(() => {
    setNotifications(prev => {
      // Limit max notifications
      if (prev.length >= 3) {
        console.warn('Max notifications reached');
        return prev;
      }

      const updated = prev
        .map(n => ({
          ...n,
          position: moveToNextPosition(n.position),
          floatOffset: Math.random() * 0.5
        }))
        .filter(n => n.position !== 'exiting');

      const newNotification: Notification = {
        id: Date.now(),
        text: EXAMPLE_BETS[currentIndex],
        position: 'entering',
        opacity: 1,
        floatOffset: 0
      };

      setCurrentIndex(prevIndex => (prevIndex + 1) % EXAMPLE_BETS.length);
      return [...updated, newNotification];
    });
  }, [currentIndex, moveToNextPosition]);

  // Start notifications with cleanup
  useEffect(() => {
    timeoutRef.current = setTimeout(addNotification, 3000);
    intervalRef.current = setInterval(addNotification, 10000);
    
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
      setNotifications([]); // Clear notifications on unmount
    };
  }, [addNotification]);

  return (
    <div 
      className="notifications-container"
      role="log"
      aria-live="polite"
      aria-atomic="false"
    >
      {notifications.map(notification => (
        <FloatingNotification
          key={notification.id}
          {...notification}
          config={NOTIFICATION_SLOTS[notification.position]}
        />
      ))}
    </div>
  );
}; 