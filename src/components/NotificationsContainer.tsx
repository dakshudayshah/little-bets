import { useEffect, useState, useRef } from 'react';
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

// Add type for browser timers
type Timer = ReturnType<typeof setTimeout>;

export const NotificationsContainer = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isMounted = useRef(true);
  const intervalRef = useRef<Timer | null>(null);
  const timeoutRef = useRef<Timer | null>(null);

  // Move this inside the effect
  const moveToNextPosition = (position: NotificationPosition): NotificationPosition => {
    switch (position) {
      case 'entering': return 'first';
      case 'first': return 'second';
      case 'second': return 'exiting';
      default: return 'exiting';
    }
  };

  useEffect(() => {
    isMounted.current = true;
    console.log('Initializing notifications at:', new Date().toISOString());

    const addNotification = () => {
      if (!isMounted.current) return;
      
      setNotifications(prev => {
        const existing = [...prev];
        console.log('Processing notifications:', existing.length);

        const updated = existing
          .map(n => ({
            ...n,
            position: moveToNextPosition(n.position)
          }))
          .filter(n => n.position !== 'exiting');

        const newNotification: Notification = {
          id: Date.now(),
          text: EXAMPLE_BETS[currentIndex],
          position: 'entering' as const,
          opacity: 1,
          floatOffset: 0
        };

        setCurrentIndex(prevIndex => (prevIndex + 1) % EXAMPLE_BETS.length);
        return [...updated, newNotification];
      });
    };
    
    // First notification after 2.5s
    timeoutRef.current = setTimeout(() => {
      console.log('First notification triggered at:', new Date().toISOString());
      addNotification();
      
      // Then start the 5s interval
      intervalRef.current = setInterval(() => {
        console.log('Interval notification triggered at:', new Date().toISOString());
        addNotification();
      }, 5000);
    }, 2500);

    return () => {
      isMounted.current = false;
      const cleanupTime = new Date().toISOString();
      console.log('Cleaning up notifications at:', cleanupTime);
      
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []); // No dependencies needed now

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