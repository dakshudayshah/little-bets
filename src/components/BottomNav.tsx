import { Link, useLocation } from 'react-router-dom';
import '../styles/BottomNav.css';

function BottomNav() {
  const location = useLocation();

  return (
    <nav className="bottom-nav">
      <Link
        to="/"
        className={`bottom-nav-item ${location.pathname === '/' ? 'active' : ''}`}
      >
        <span className="bottom-nav-icon">&#9750;</span>
        <span className="bottom-nav-label">Home</span>
      </Link>
      <Link
        to="/create"
        className={`bottom-nav-item ${location.pathname === '/create' ? 'active' : ''}`}
      >
        <span className="bottom-nav-icon">+</span>
        <span className="bottom-nav-label">Create</span>
      </Link>
      <Link
        to="/profile"
        className={`bottom-nav-item ${location.pathname === '/profile' ? 'active' : ''}`}
      >
        <span className="bottom-nav-icon">&#9787;</span>
        <span className="bottom-nav-label">Profile</span>
      </Link>
    </nav>
  );
}

export default BottomNav;
