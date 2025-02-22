import { Link } from 'react-router-dom';
import { NotificationsContainer } from './NotificationsContainer';
import '../styles/HomeHero.css';
import betIllustration from '../assets/bet-illustration.png';

export const HomeHero = () => {
  return (
    <div className="hero-container">
      <NotificationsContainer />
      <div className="hero-content">
        <div className="hero-logo">
          <h1>Little Bets</h1>
        </div>
        <img 
          src={betIllustration} 
          alt="People making bets" 
          className="hero-illustration"
        />
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