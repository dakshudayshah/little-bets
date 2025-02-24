import { Link } from 'react-router-dom';
import { Bet } from '../types';
import { ShareButtons } from './ShareButtons';
import '../styles/BetCard.css';

interface BetCardProps {
  bet: Bet;
}

export const BetCard = ({ bet }: BetCardProps) => {
  return (
    <div className="bet-card">
      <Link to={`/bets/${bet.id}`} className="bet-title">
        <h2>{bet.question}</h2>
      </Link>

      <div className="bet-stats">
        <div className="stat">
          <span>Created by</span>
          <strong>{bet.creator_name}</strong>
        </div>
        <div className="stat">
          <span>Predictions</span>
          <strong>{bet.participants?.length || 0}</strong>
        </div>
        <div className="stat">
          <span>Type</span>
          <strong>{bet.type}</strong>
        </div>
      </div>

      <ShareButtons betId={bet.id} title={bet.question} />

      {bet.participants && bet.participants.length > 0 && (
        <div className="predictions-list">
          {bet.participants.map((participant, index) => (
            <div key={index} className="prediction-item">
              <div className="prediction-name">{participant.name}</div>
              <div className="prediction-value">{participant.prediction}</div>
              <div className="prediction-date">
                {new Date(participant.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 