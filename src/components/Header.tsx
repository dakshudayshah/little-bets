import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Header.css';

const BurgerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="header-brand">
          Little Bets
        </Link>
        
        <button 
          className="burger-menu"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <BurgerIcon />
        </button>

        <nav className={`header-nav ${isMenuOpen ? 'open' : ''}`}>
          <a 
            href="https://buymeacoffee.com/dakshudayshah"
            target="_blank"
            rel="noopener noreferrer"
          >
            Support This Project
          </a>
          <Link to="/bets">All Bets</Link>
          <a 
            href="mailto:daksh.uday.shah@gmail.com?subject=Little%20Bets%20-%20Feature%20Request"
          >
            Feature Request
          </a>
          <Link to="/create" className="cta-button">Create Bet</Link>
        </nav>
      </div>
    </header>
  );
}; 