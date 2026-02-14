import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Header.css';

interface HeaderProps {
  onSignInClick: () => void;
}

function Header({ onSignInClick }: HeaderProps) {
  const { user, signOut } = useAuth();

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="header-logo">Little Bets</Link>
        <div className="header-actions">
          <Link to="/create" className="header-create-btn">Create Bet</Link>
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
