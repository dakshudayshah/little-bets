import { useState, useEffect } from 'react';
import { FloatingNotification } from './FloatingNotification';
import '../styles/FloatingNotification.css';

const EXAMPLE_BETS = [
  // Yes/No bets
  {
    title: "Fashion Faux Pas",
    question: "Will Rajeev wear socks with sandals in public this year? (Yes/No)"
  },
  {
    title: "Gift Giving Gaffe",
    question: "Will Emily re-gift something she received last year? (Yes/No)"
  },
  {
    title: "Fitness Fail",
    question: "Will Pooja actually use her expensive gym membership more than 5 times this month? (Yes/No)"
  },
  {
    title: "Bookworm Betrayal",
    question: "Will Uncle Tom actually finish reading that \"life-changing\" book he started? (Yes/No)"
  },
  {
    title: "\"I Told You So\" Moment",
    question: "Will Aunt Patricia's questionable life decision backfire spectacularly within the next 6 months? (Yes/No)"
  },
  {
    title: "Cooking Catastrophe",
    question: "Will David's attempt at a \"simple\" new recipe result in edible food? (Yes/No)"
  },
  {
    title: "Home Renovation Horror",
    question: "Will Aunt Susan's DIY home project end in a Pinterest-worthy success? (Yes/No)"
  },
  
  // Number bets (days/months/years)
  {
    title: "Relationship Roulette",
    question: "How many days until Ashley drunkenly texts her ex again? (Days)"
  },
  {
    title: "Diet Disaster",
    question: "How many days will Uncle Joe last on his new fad diet before caving to pizza? (Days)"
  },
  {
    title: "Dating App Debacle",
    question: "How many dates will Neha go on from dating apps before declaring \"dating is dead\"? (Dates)"
  },
  {
    title: "Tech Tantrum",
    question: "How many hours until Grandpa Bob throws his phone across the room in frustration? (Hours)"
  },
  {
    title: "Parking Predicament",
    question: "How many attempts will it take Chris to parallel park in a moderately tight spot? (Attempts)"
  },
  {
    title: "Plant Parenthood",
    question: "How many weeks until Michael's new houseplant dies a slow, agonizing death? (Weeks)"
  },
  {
    title: "Punctuality Predicament",
    question: "How many minutes late will Jessica be to the next family gathering? (Minutes)"
  },
  
  // Custom options bets
  {
    title: "Social Media Stalker",
    question: "Will Priya's next Instagram post be a thirst trap or a humble brag?"
  },
  {
    title: "Job Jump Scare",
    question: "Will Kevin quit his job in a dramatic fashion or just quietly slip out?"
  },
  {
    title: "Travel Trouble",
    question: "On Meena's next vacation, what's more likely: lost luggage or a public argument with her travel buddy?"
  },
  {
    title: "Karaoke Calamity",
    question: "Will Anika's karaoke performance be cringe or comedy gold?"
  },
  {
    title: "Road Trip Ruckus",
    question: "Who is more likely to get hangry and cause a roadside meltdown: Sarah or Vikram?"
  },
  {
    title: "Movie Marathon Meltdown",
    question: "Who will fall asleep first during the next movie marathon: Aunt Carol or Cousin Ravi?"
  }
];

export const NotificationsContainer = () => {
  const [notifications, setNotifications] = useState<Array<{ id: number; bet: typeof EXAMPLE_BETS[0] }>>([]);
  const [lastNotificationTime, setLastNotificationTime] = useState(Date.now());

  useEffect(() => {
    // Show initial notification after 3 seconds
    const initialTimer = setTimeout(() => {
      addRandomNotification();
    }, 3000);

    return () => clearTimeout(initialTimer);
  }, []);

  useEffect(() => {
    // Schedule next notification between 20-40 seconds after the last one
    const nextNotificationDelay = Math.floor(Math.random() * 20000) + 20000;
    
    const timer = setTimeout(() => {
      addRandomNotification();
      setLastNotificationTime(Date.now());
    }, nextNotificationDelay);

    return () => clearTimeout(timer);
  }, [lastNotificationTime]);

  const addRandomNotification = () => {
    const randomBet = EXAMPLE_BETS[Math.floor(Math.random() * EXAMPLE_BETS.length)];
    const newNotification = {
      id: Date.now(),
      bet: randomBet
    };

    setNotifications(prev => [...prev, newNotification]);

    // Remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 5000);
  };

  return (
    <div className="notifications-container">
      {notifications.map(notification => (
        <FloatingNotification 
          key={notification.id}
          title={notification.bet.title}
          message={notification.bet.question}
        />
      ))}
    </div>
  );
}; 