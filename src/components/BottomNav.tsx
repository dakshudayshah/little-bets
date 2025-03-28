import { Link, useLocation } from 'react-router-dom';
import '../styles/BottomNav.css';

export const BottomNav = () => {
  const location = useLocation();
  
  return (
    <nav className="bottom-nav">
      <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path fill="currentColor" d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
        </svg>
        <span>Home</span>
      </Link>
      
      <Link to="/create" className={`nav-item ${location.pathname === '/create' ? 'active' : ''}`}>
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
        </svg>
        <span>Create</span>
      </Link>

      <Link to="/profile" className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`}>
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
        <span>Profile</span>
      </Link>
    </nav>
  );
}; 