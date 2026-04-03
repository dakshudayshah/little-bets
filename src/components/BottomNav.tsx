import { Link, useLocation } from 'react-router-dom';
import '../styles/BottomNav.css';

function BottomNav() {
  const location = useLocation();

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
      <Link
        to="/"
        className={`bottom-nav-item ${location.pathname === '/' ? 'active' : ''}`}
        aria-current={location.pathname === '/' ? 'page' : undefined}
      >
        <span className="bottom-nav-icon">&#9750;</span>
        <span className="bottom-nav-label">Home</span>
      </Link>
      <Link
        to="/my-bets"
        className={`bottom-nav-item ${location.pathname === '/my-bets' ? 'active' : ''}`}
        aria-current={location.pathname === '/my-bets' ? 'page' : undefined}
      >
        <span className="bottom-nav-icon">&#9788;</span>
        <span className="bottom-nav-label">My Bets</span>
      </Link>
      <Link
        to="/settings"
        className={`bottom-nav-item ${location.pathname === '/settings' ? 'active' : ''}`}
        aria-current={location.pathname === '/settings' ? 'page' : undefined}
      >
        <span className="bottom-nav-icon">&#9881;</span>
        <span className="bottom-nav-label">Settings</span>
      </Link>
    </nav>
  );
}

export default BottomNav;
