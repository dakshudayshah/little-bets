import { useState, useEffect, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import { Bet, fetchAllBets } from '../lib/supabase';
import { formatDate, capitalizeFirstLetter } from '../utils/helpers';
import '../styles/AllBets.css';

// BetCard component for displaying individual bets
interface BetCardProps {
  bet: Bet;
}

const BetCard = memo(({ bet }: BetCardProps) => {
  // Helper function to get bet options based on type
  const getBetOptions = (bet: Bet): string => {
    switch (bet.bettype) {
      case 'yesno':
        return 'Yes or No';
      case 'number':
        return `Number (${bet.unit || 'units'})`;
      case 'custom':
        return bet.customoption1 && bet.customoption2 
          ? `${bet.customoption1} or ${bet.customoption2}`
          : 'Custom options';
      default:
        return '';
    }
  };

  return (
    <div className="bet-card">
      <h2 className="bet-question">{bet.question}</h2>
      
      <div className="bet-meta">
        <span className="bet-creator">Created by {bet.creator_name}</span>
        <span className="bet-date">{formatDate(bet.created_at)}</span>
      </div>
      
      <div className="bet-type">
        <span className="type-label">Type:</span>
        <span className="type-value">{capitalizeFirstLetter(bet.bettype)}</span>
      </div>
      
      <div className="bet-options">
        <span className="options-label">Options:</span>
        <span className="options-value">{getBetOptions(bet)}</span>
      </div>
      
      {bet.description && (
        <p className="bet-description">{bet.description}</p>
      )}
      
      <Link to={`/bet/${bet.code_name}`} className="view-bet-link">
        View Details
      </Link>
    </div>
  );
});

BetCard.displayName = 'BetCard';

// EmptyState component for when there are no bets
const EmptyState = memo(() => (
  <div className="empty-state">
    <h2>No bets yet</h2>
    <p>Be the first to create a bet!</p>
    <Link to="/create" className="create-bet-button">
      Create a Bet
    </Link>
  </div>
));

EmptyState.displayName = 'EmptyState';

// Loading component
const Loading = memo(() => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
    <p>Loading bets...</p>
  </div>
));

Loading.displayName = 'Loading';

// Error component
interface ErrorMessageProps {
  message: string;
  onRetry: () => void;
}

const ErrorMessage = memo(({ message, onRetry }: ErrorMessageProps) => (
  <div className="error-container">
    <p className="error-message">{message}</p>
    <button onClick={onRetry} className="retry-button">
      Try Again
    </button>
  </div>
));

ErrorMessage.displayName = 'ErrorMessage';

// Main AllBets component
export const AllBets = () => {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Function to fetch bets
  const fetchBets = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const { data, error } = await fetchAllBets();
      
      if (error) throw error;
      setBets(data || []);
      
    } catch (err) {
      console.error('Error fetching bets:', err);
      setError('Failed to load bets. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch bets on component mount
  useEffect(() => {
    fetchBets();
  }, [fetchBets]);

  // Render based on state
  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchBets} />;
  }

  if (bets.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="all-bets-container">
      <div className="header">
        <h1>All Bets</h1>
        <Link to="/create" className="create-bet-button">
          Create a Bet
        </Link>
      </div>
      
      <div className="bets-grid">
        {bets.map((bet) => (
          <BetCard key={bet.id} bet={bet} />
        ))}
      </div>
    </div>
  );
}; 