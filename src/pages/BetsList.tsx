import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BetWithParticipants } from '../types';
import { betService } from '../services/betService';
import '../styles/BetsList.css';

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
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
        setError('Failed to load bets');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBets();
  }, []);

  if (isLoading) {
    return <div className="container">Loading bets...</div>;
  }

  if (error) {
    return <div className="container">{error}</div>;
  }

  return (
    <div className="container">
      <h1>Active Bets</h1>
      <div className="bets-grid">
        {bets.map(bet => (
          <Link to={`/bet/${bet.code_name}`} key={bet.id} className="bet-card">
            <div className="bet-header">
              <h2>{bet.question}</h2>
              <span className="bet-type">{bet.type}</span>
            </div>
            <p className="bet-creator">Created by {bet.creator_name}</p>
            <div className="bet-footer">
              <span>{bet.participants.length} predictions</span>
              <span>{formatDate(bet.created_at)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}; 