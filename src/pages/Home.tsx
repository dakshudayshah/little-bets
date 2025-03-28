import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bet, fetchAllBets, BET_TYPE_NAMES } from '../lib/supabase';
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

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Little Bets</h1>
        <p className="tagline">friendly bets on life's little moments</p>
      </div>

      {loading ? (
        <div className="loading-state">Loading bets...</div>
      ) : error ? (
        <div className="error-state">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      ) : (
        <div className="bets-list">
          {bets.length === 0 ? (
            <div className="empty-state">
              No bets yet. Start one!
            </div>
          ) : (
            bets.map(bet => (
              <Link to={`/bet/${bet.code_name}`} key={bet.id} className="bet-item">
                <div className="bet-content">
                  <h2>{bet.question}</h2>
                  <div className="bet-details">
                    <span className="bet-type">{BET_TYPE_NAMES[bet.bettype]}</span>
                    <span className="bet-creator">by {bet.creator_name}</span>
                  </div>
                </div>
                <div className="bet-stats">
                  <span>{bet.participant_count || 0} predictions</span>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}; 