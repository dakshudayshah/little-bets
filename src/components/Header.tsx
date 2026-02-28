import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import '../styles/Header.css';

interface HeaderProps {
  onSignInClick: () => void;
}

function Header({ onSignInClick }: HeaderProps) {
  const { user, signOut } = useAuth();
  const location = useLocation();

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="header-logo">Little Bets</Link>
        <nav className="header-nav">
          <Link to="/" className={`header-nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
          <Link to="/create" className={`header-nav-link ${location.pathname === '/create' ? 'active' : ''}`}>Create</Link>
          <Link to="/profile" className={`header-nav-link ${location.pathname === '/profile' ? 'active' : ''}`}>Profile</Link>
        </nav>
        <div className="header-right">
          <ThemeToggle />
          {user ? (
            <button className="header-auth-btn" onClick={signOut}>
              Sign Out
            </button>
          ) : (
            <button className="header-auth-btn" onClick={onSignInClick}>
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
