import { Link } from 'react-router-dom';
import { NotificationsContainer } from './NotificationsContainer';
import '../styles/HomeHero.css';

export const HomeHero = () => {
  return (
    <div className="hero-container">
      <NotificationsContainer />
      <div className="hero-content">
        <div className="hero-logo">
          <h1>Little Bets</h1>
        </div>
        <p className="hero-tagline">
          Make friendly bets with your friends on life's little moments
        </p>
        <Link to="/create" className="cta-button">
          Create New Bet
        </Link>
      </div>
    </div>
  );
}; 