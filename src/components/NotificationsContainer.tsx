import { useEffect, useState, useCallback } from 'react';
import { FloatingNotification } from './FloatingNotification';

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

type NotificationSlot = 'first' | 'second';

const NOTIFICATION_SLOTS: Record<NotificationSlot, { top: string; right: string }> = {
  first: {
    top: '80px',
    right: '20px'
  },
  second: {
    top: '160px',
    right: '20px'
  }
} as const;

// Add explicit type for status
type NotificationStatus = 'entering' | 'visible' | 'exiting';

interface Notification {
  id: number;
  text: string;
  status: NotificationStatus;
  slot: NotificationSlot;
}

export const NotificationsContainer = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const addNotification = useCallback(() => {
    console.log('Current notifications:', notifications);
    
    setNotifications(prev => {
      // First transition: Move visible to exiting
      const withExiting = prev.map(n => {
        console.log('Processing notification:', n.id, n.status, '→', 
          n.status === 'visible' ? 'exiting' : 
          n.status === 'entering' ? 'visible' : 
          n.status
        );
        
        if (n.status === 'visible') {
          return { ...n, status: 'exiting' as const };
        }
        if (n.status === 'entering') {
          return { ...n, status: 'visible' as const };
        }
        return n;
      });

      // Remove old notifications
      const filtered = withExiting.filter(n => n.status !== 'exiting');

      // Add new notification
      const newNotification: Notification = {
        id: Date.now(),
        text: EXAMPLE_BETS[currentIndex],
        status: 'entering',
        slot: 'first'
      };

      console.log('Adding new notification:', newNotification);

      setCurrentIndex(prevIndex => (prevIndex + 1) % EXAMPLE_BETS.length);
      return [...filtered, newNotification];
    });
  }, [currentIndex, notifications]);

  useEffect(() => {
    // Start first notification after a short delay
    const initialTimer = setTimeout(() => {
      addNotification();
    }, 1000);
    
    // Then continue with 5-second interval
    const interval = setInterval(addNotification, 5000);
    
    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [addNotification]);

  return (
    <div className="notifications-container">
      {notifications.map(notification => (
        <FloatingNotification
          key={notification.id}
          text={notification.text}
          position={NOTIFICATION_SLOTS[notification.slot]}
          status={notification.status}
        />
      ))}
    </div>
  );
}; 