import { Link } from 'react-router-dom';
import { BetWithParticipants } from '../types';

// ... other imports

export const BetsList = ({ bets }: { bets: BetWithParticipants[] }) => {
  return (
    <div className="container">
      <h1>All Bets</h1>
      <div className="bets-grid">
        {bets.map(bet => (
          // Changed from code_name to id for the route
          <Link to={`/bets/${bet.id}`} key={bet.id} className="bet-card">
            <div className="bet-header">
              <h2>{bet.question}</h2>
              <span className="bet-type">{bet.type}</span>
            </div>
            <div className="bet-footer">
              <span>{bet.participants.length} predictions</span>
              {/* Remove date formatting since created_at is not in the type */}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}; 