import { Link } from 'react-router-dom';
import { NotificationsContainer } from './NotificationsContainer';
import '../styles/HomeHero.css';
import { useState } from 'react';
import betIllustration from '../assets/bet-illustration.png';

export const HomeHero = () => {
  const [imageError, setImageError] = useState(false);
  console.log('Attempting to load image from:', betIllustration);

  return (
    <div className="hero-container">
      <NotificationsContainer />
      <div className="hero-content">
        <div className="hero-logo">
          <h1>Little Bets</h1>
        </div>
        {!imageError ? (
          <img 
            src={betIllustration} 
            alt="People making bets" 
            className="hero-illustration"
            onError={() => {
              console.error('Failed to load illustration');
              setImageError(true);
            }}
          />
        ) : null}
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