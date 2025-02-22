import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BetWithParticipants } from '../types';
import { betService } from '../services/betService';
import '../styles/BetsList.css';

const formatBetTypeInfo = (bet: BetWithParticipants) => {
  switch (bet.type) {
    case 'GENDER':
      const boyCount = bet.participants.filter(p => p.prediction === 'BOY').length;
      const girlCount = bet.participants.filter(p => p.prediction === 'GIRL').length;
      return `${boyCount} Boy vs ${girlCount} Girl predictions`;
    
    case 'SCALE':
      if (!bet.participants.length) return 'No predictions yet';
      const validScalePredictions = bet.participants
        .map(p => Number(p.prediction))
        .filter(n => !isNaN(n));
      if (!validScalePredictions.length) return 'No valid predictions yet';
      const scaleAvg = validScalePredictions.reduce((a, b) => a + b, 0) / validScalePredictions.length;
      return `Average: ${scaleAvg.toFixed(1)} (${bet.min_value || 1}-${bet.max_value || 10})`;
    
    case 'DURATION':
      if (!bet.participants.length) return 'No predictions yet';
      const validDurationPredictions = bet.participants
        .map(p => Number(p.prediction))
        .filter(n => !isNaN(n));
      if (!validDurationPredictions.length) return 'No valid predictions yet';
      const durationAvg = validDurationPredictions.reduce((a, b) => a + b, 0) / validDurationPredictions.length;
      return `Average: ${durationAvg.toFixed(1)} ${bet.unit || 'units'}`;
    
    default:
      return 'No predictions yet';
  }
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
              <p className="bet-stats">{formatBetTypeInfo(bet)}</p>
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