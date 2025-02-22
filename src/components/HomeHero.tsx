import { Link } from 'react-router-dom';
import { NotificationsContainer } from './NotificationsContainer';
import '../styles/HomeHero.css';
import { useState } from 'react';

export const HomeHero = () => {
  const [imageError, setImageError] = useState(false);
  
  return (
    <div className="hero-container">
      <NotificationsContainer />
      <div className="hero-content">
        <div className="hero-logo">
          <h1>Little Bets</h1>
        </div>
        {!imageError && (
          <img 
            src="/bet-illustration.png"
            alt="People making bets" 
            className="hero-illustration"
            onError={() => setImageError(true)}
          />
        )}
        <p className="hero-tagline">
          Make friendly bets with your friends on life's little moments
        </p>
        <Link to="/create" className="cta-button">
          Create Bet
        </Link>
      </div>
    </div>
  );
}; 