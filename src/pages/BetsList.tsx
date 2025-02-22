import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BetWithParticipants } from '../types';
import { betService } from '../services/betService';
import '../styles/BetsList.css';

export const BetsList = () => {
  const [bets, setBets] = useState<BetWithParticipants[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBets = async () => {
      try {
        const betsData = await betService.getAllBets();
        setBets(betsData);
      } catch (err) {
        setError('Failed to load bets. Please try again later.');
        console.error('Fetch bets error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBets();
  }, []);

  if (isLoading) {
    return (
      <div className="container">
        <div className="content">
          <p className="loading">Loading bets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="content">
        <h1>Active Bets</h1>
        
        {error && <p className="error-message">{error}</p>}
        
        <div className="bets-grid">
          {bets.map(bet => (
            <Link to={`/bet/${bet.code_name}`} key={bet.id} className="bet-card">
              <h2>{bet.question}</h2>
              <p className="bet-type">{bet.type}</p>
              <p className="bet-creator">Created by {bet.creator_name}</p>
              <p className="bet-participants">
                {bet.participants.length} predictions
              </p>
              <p className="bet-date">
                Created {new Date(bet.created_at).toLocaleDateString()}
              </p>
            </Link>
          ))}

          {!error && bets.length === 0 && (
            <p className="no-bets">
              No bets yet. <Link to="/create">Create one!</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}; 