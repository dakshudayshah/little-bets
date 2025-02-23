import { useEffect, useState, useRef } from 'react';
import { FloatingNotification } from './FloatingNotification';
import { Notification } from '../types/notifications';
import '../styles/FloatingNotification.css';

const EXAMPLE_BETS = [
  {
    title: "Relationship Roulette",
    question: "How long until Ashley drunkenly texts her ex again? (Over/Under: 2 weeks)"
  },
  {
    title: "Social Media Stalker",
    question: "Will Priya's next Instagram post be a thirst trap or a humble brag?"
  },
  {
    title: "Diet Disaster",
    question: "How many days will Uncle Joe last on his new fad diet before caving to pizza? (Days: 3, 5, 7)"
  },
  {
    title: "Job Jump Scare",
    question: "Will Kevin quit his job in a dramatic fashion (think shouting, quitting via email, or ghosting) or just quietly slip out?"
  },
  {
    title: "Dating App Debacle",
    question: "How many dates will Neha go on from dating apps before declaring \"dating is dead\"? (Dates: 5, 10, 15)"
  },
  {
    title: "Home Renovation Horror",
    question: "Will Aunt Susan's DIY home project end in a Pinterest-worthy success or a call to a professional (and a hefty bill)?"
  },
  {
    title: "Fashion Faux Pas",
    question: "Will Rajeev wear socks with sandals in public this year, and will we witness it? (Yes/No)"
  },
  {
    title: "Cooking Catastrophe",
    question: "Will David's attempt at a \"simple\" new recipe result in edible food or a kitchen fire drill?"
  },
  {
    title: "Travel Trouble",
    question: "On Meena's next vacation, what's more likely: lost luggage or a public argument with her travel buddy?"
  },
  {
    title: "Tech Tantrum",
    question: "How long until Grandpa Bob throws his phone across the room in frustration with technology? (Hours/Days)"
  },
  {
    title: "Gift Giving Gaffe",
    question: "Will Emily re-gift something she received last year, and will the original giver notice? (Yes/No)"
  },
  {
    title: "Parking Predicament",
    question: "How many attempts will it take Chris to parallel park in a moderately tight spot? (Attempts: 3, 5, 7+)"
  },
  {
    title: "Karaoke Calamity",
    question: "Will Anika attempt a song she absolutely cannot sing at the next karaoke night, and will it be cringe or comedy gold?"
  },
  {
    title: "Plant Parenthood",
    question: "How long until Michael's new houseplant dies a slow, agonizing death? (Weeks: 2, 4, 6)"
  },
  {
    title: "Fitness Fail",
    question: "Will Pooja actually use her expensive gym membership more than 5 times this month? (Yes/No)"
  },
  {
    title: "Bookworm Betrayal",
    question: "Will Uncle Tom actually finish reading that \"life-changing\" book he started, or will it become another coffee table ornament?"
  },
  {
    title: "Punctuality Predicament",
    question: "How late will Jessica be to the next family gathering? (Minutes: 15, 30, 45+)"
  },
  {
    title: "Road Trip Ruckus",
    question: "On the next road trip, who is more likely to get hangry and cause a roadside meltdown: Sarah (driver) or Vikram (passenger)?"
  },
  {
    title: "Movie Marathon Meltdown",
    question: "During the next movie marathon, who will fall asleep first: Aunt Carol or Cousin Ravi?"
  },
  {
    title: "\"I Told You So\" Moment",
    question: "Will Aunt Patricia's questionable life decision backfire spectacularly within the next 6 months? (Yes/No)"
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