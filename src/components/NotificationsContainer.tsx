import { useEffect, useState } from 'react';
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

// Single fixed position where notifications will appear
const NOTIFICATION_POSITION = {
  top: '80px',  // Below header
  right: '0',   // Start from right edge
};

// Add explicit type for status
type NotificationStatus = 'entering' | 'visible' | 'exiting';

interface Notification {
  id: number;
  text: string;
  status: NotificationStatus;
}

export const NotificationsContainer = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    let currentIndex = 0;
    
    const addNotification = () => {
      setNotifications(prev => {
        // Type safety check
        console.log('Current notifications:', prev.map(n => n.status));
        
        const filtered = prev.filter(n => n.status !== 'exiting');
        
        const updated = filtered.map(n => {
          const newStatus: NotificationStatus = n.status === 'visible' ? 'exiting' : 
            n.status === 'entering' ? 'visible' : n.status;
          return { ...n, status: newStatus };
        });

        const newNotification: Notification = {
          id: Date.now(),
          text: EXAMPLE_BETS[currentIndex],
          status: 'entering' as const // Ensure literal type
        };

        return [...updated, newNotification].slice(-2);
      });

      currentIndex = (currentIndex + 1) % EXAMPLE_BETS.length;
    };

    const interval = setInterval(addNotification, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="notifications-container">
      {notifications.map((notification, index) => (
        <FloatingNotification
          key={notification.id}
          text={notification.text}
          position={NOTIFICATION_POSITION}
          status={notification.status}
          index={index}
        />
      ))}
    </div>
  );
}; 