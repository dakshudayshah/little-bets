import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BetCard } from './BetCard';
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
        const fetchedBets = await betService.getAllBets();
        setBets(fetchedBets);
      } catch (err) {
        setError('Failed to load bets');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBets();
  }, []);

  if (isLoading) return <div className="container loading">Loading...</div>;
  if (error) return <div className="container error-message">{error}</div>;
  if (bets.length === 0) {
    return (
      <div className="container">
        <div className="no-bets">
          <p>No bets yet! Be the first to create one.</p>
          <Link to="/create">Create a Bet</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="bets-grid">
        {bets.map(bet => (
          <BetCard key={bet.id} bet={bet} />
        ))}
      </div>
    </div>
  );
}; 