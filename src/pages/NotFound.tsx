import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { track } from '../lib/analytics';
import '../styles/NotFound.css';

interface NotFoundProps {
  variant?: 'route' | 'bet';
  message?: string;
}

function NotFound({ variant = 'route', message }: NotFoundProps) {
  useEffect(() => {
    document.title = 'Not found — Little Bets';
    track('page_viewed', { page: 'not_found', variant });
  }, [variant]);

  const heading = variant === 'bet' ? 'Bet not found' : 'Page not found';
  const body =
    message ??
    (variant === 'bet'
      ? "We couldn't find that bet. It may have been deleted or the link is wrong."
      : "We couldn't find that page. Maybe try one of these:");

  return (
    <div className="page not-found">
      <p className="not-found-code">404</p>
      <h1 className="not-found-heading">{heading}</h1>
      <p className="not-found-body">{body}</p>
      <div className="not-found-actions">
        <Link to="/" className="not-found-cta">Start a new bet</Link>
        <Link to="/profile" className="not-found-secondary">See your bets</Link>
      </div>
    </div>
  );
}

export default NotFound;
