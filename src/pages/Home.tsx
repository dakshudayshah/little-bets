import { useState, useEffect, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import { Bet, fetchAllBets } from '../lib/supabase';
import { formatDate, capitalizeFirstLetter } from '../utils/helpers';
import '../styles/Home.css';

// BetCard component for displaying individual bets
interface BetCardProps {
  bet: Bet;
}

const BetCard = memo(({ bet }: BetCardProps) => {
  // Helper function to get bet type display name
  const getBetTypeDisplay = (type: string): string => {
    switch (type) {
      case 'custom':
        return 'Multiple Choice';
      case 'number':
        return 'Number Range';
      case 'yesno':
        return 'Yes or No';
      default:
        return capitalizeFirstLetter(type);
    }
  };

  // Helper function to get bet options
  const getBetOptions = (bet: Bet): string => {
    switch (bet.bettype) {
      case 'yesno':
        return 'Yes or No';
      case 'number':
        return `${bet.min_value || 0} to ${bet.max_value || 100} ${bet.unit || ''}`;
      case 'custom':
        return bet.customoption1 && bet.customoption2 
          ? `${bet.customoption1} or ${bet.customoption2}`
          : 'Multiple options';
      default:
        return '';
    }
  };

  return (
    <Link to={`/bet/${bet.code_name}`} className="bet-card">
      <h2 className="bet-question">{bet.question}</h2>
      
      <div className="bet-meta">
        <span className="bet-creator">By {bet.creator_name}</span>
        <span className="bet-type">{getBetTypeDisplay(bet.bettype)}</span>
      </div>
      
      <div className="bet-options">
        {getBetOptions(bet)}
      </div>
      
      <div className="bet-date">
        {formatDate(bet.created_at)}
      </div>
    </Link>
  );
});

BetCard.displayName = 'BetCard';

// EmptyState component
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
  <div className="loading-state">
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
  <div className="error-state">
    <p>{message}</p>
    <button onClick={onRetry} className="retry-button">
      Try Again
    </button>
  </div>
));

ErrorMessage.displayName = 'ErrorMessage';

// Main Home component
export const Home = () => {
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
    <div className="home-container">
      <div className="bets-list">
        {bets.map((bet) => (
          <BetCard key={bet.id} bet={bet} />
        ))}
      </div>
    </div>
  );
}; 