import { Link } from 'react-router-dom';
import { BetWithParticipants } from '../types';
import { formatDate } from '../utils/dateUtils';
import '../styles/BetsList.css';

interface BetsListProps {
  bets: BetWithParticipants[];
}

export const BetsList = ({ bets }: BetsListProps) => {
  return (
    <div className="container">
      <h1>All Bets</h1>
      <div className="bets-grid">
        {bets.map(bet => (
          <Link to={`/bet/${bet.code_name}`} key={bet.id} className="bet-card">
            <div className="bet-header">
              <h2>{bet.question}</h2>
              <span className="bet-type">{bet.type}</span>
            </div>
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