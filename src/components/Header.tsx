import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Header.css';

const CoffeeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 8C2 7.44772 2.44772 7 3 7H16C16.5523 7 17 7.44772 17 8V16C17 18.2091 15.2091 20 13 20H6C3.79086 20 2 18.2091 2 16V8Z" stroke="currentColor" strokeWidth="2"/>
    <path d="M17 8H19C20.6569 8 22 9.34315 22 11C22 12.6569 20.6569 14 19 14H17" stroke="currentColor" strokeWidth="2"/>
    <path d="M9 3V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const BurgerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  console.log('Header links:', {
    brand: '/',
    bets: '/bets',
    create: '/create',
    support: 'buymeacoffee.com'
  });
  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="header-brand">
          Little Bets
        </Link>
        
        <button className="burger-menu" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <BurgerIcon />
        </button>

        <div className={`header-links ${isMenuOpen ? 'open' : ''}`}>
          <a 
            href="https://buymeacoffee.com/dakshudayshah"
            target="_blank"
            rel="noopener noreferrer"
            className="support-button"
          >
            <CoffeeIcon /> Support This Project
          </a>
          <Link to="/bets" className="header-link">All Bets</Link>
          <Link to="/create" className="cta-button">Create Bet</Link>
        </div>
      </div>
    </header>
  );
}; 