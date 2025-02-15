import { Link, useLocation } from 'react-router-dom';
import '../styles/Header.css';

export const Header = () => {
  const location = useLocation();
  
  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          Little Bets
        </Link>
        
        <nav className="nav">
          <Link 
            to="/bets" 
            className={`nav-link ${location.pathname === '/bets' ? 'active' : ''}`}
          >
            All Bets
          </Link>
          <Link 
            to="/create" 
            className={`nav-link create-button ${location.pathname === '/create' ? 'active' : ''}`}
          >
            Create New Bet
          </Link>
        </nav>
      </div>
    </header>
  );
}; 