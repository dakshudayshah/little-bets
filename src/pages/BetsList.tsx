import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BetWithParticipants } from '../types';
import { betService } from '../services/betService';
import '../styles/BetsList.css';

const EndedBets = ({ bets }: { bets: BetWithParticipants[] }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (bets.length === 0) return null;

  return (
    <div className="ended-bets-section">
      <button 
        className="toggle-button"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? 'Hide' : 'Show'} Ended Bets ({bets.length})
      </button>
      
      {isExpanded && (
        <div className="bets-grid">
          {bets.map(bet => (
            <Link to={`/bet/${bet.code_name}`} key={bet.id} className="bet-card ended-bet">
              <h2>{bet.question}</h2>
              <p className="bet-type">{bet.type}</p>
              <p className="bet-participants">
                {bet.participants.length} predictions
              </p>
              <p className="bet-date">
                Ended {new Date(bet.ended_at!).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

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

  const activeBets = bets.filter(bet => bet.status === 'ACTIVE');
  const endedBets = bets.filter(bet => bet.status === 'ENDED');

  return (
    <div className="container">
      <div className="content">
        <h1>Active Bets</h1>
        
        {error && <p className="error-message">{error}</p>}
        
        <div className="bets-grid">
          {activeBets.map(bet => (
            <Link to={`/bet/${bet.code_name}`} key={bet.id} className="bet-card">
              <h2>{bet.question}</h2>
              <p className="bet-type">{bet.type}</p>
              <p className="bet-participants">
                {bet.participants.length} predictions
              </p>
              <p className="bet-date">
                Created {new Date(bet.created_at).toLocaleDateString()}
              </p>
            </Link>
          ))}

          {!error && activeBets.length === 0 && (
            <p className="no-bets">
              No active bets. <Link to="/create">Create one!</Link>
            </p>
          )}
        </div>

        <EndedBets bets={endedBets} />
      </div>
    </div>
  );
}; 