import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bet, fetchAllBets, BET_TYPE_NAMES } from '../lib/supabase';
import { formatDate } from '../utils/helpers';
import '../styles/Home.css';

export const Home = () => {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadBets = async () => {
      try {
        const { data, error } = await fetchAllBets();
        if (error) throw error;
        setBets(data || []);
      } catch (err) {
        console.error('Error loading bets:', err);
        setError('Failed to load bets');
      } finally {
        setLoading(false);
      }
    };

    loadBets();
  }, []);

  const getBetOptions = (bet: Bet) => {
    switch (bet.bettype) {
      case 'yesno':
        return 'Yes or No';
      case 'custom':
        return bet.customoption1 && bet.customoption2 
          ? `${bet.customoption1} or ${bet.customoption2}`
          : 'Multiple options';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Loading bets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  if (bets.length === 0) {
    return (
      <div className="empty-state">
        <p>No bets yet. Be the first to create one!</p>
        <Link to="/create" className="create-bet-button">
          Create a Bet
        </Link>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="bets-list">
        {bets.map((bet) => (
          <Link to={`/bet/${bet.code_name}`} key={bet.id} className="bet-card">
            <h2>{bet.question}</h2>
            <div className="bet-meta">
              <span className="bet-creator">Created by {bet.creator_name}</span>
              <span className="bet-type">{BET_TYPE_NAMES[bet.bettype]}</span>
              <span className="bet-date">{formatDate(bet.created_at)}</span>
            </div>
            {bet.description && (
              <p className="bet-description">{bet.description}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}; 