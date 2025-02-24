import { Bet } from '../types';
import { ShareButton } from './ShareButton';
import { formatDate } from '../utils/dateUtils';

interface BetCardProps {
  bet: Bet;
}

export const BetCard = ({ bet }: BetCardProps) => {
  return (
    <div className="bet-card">
      <h2>{bet.question}</h2>
      {/* ... other bet info ... */}
      <div className="bet-card-footer">
        <span className="bet-date">{formatDate(bet.created_at)}</span>
        <ShareButton betCode={bet.code} />
      </div>
    </div>
  );
}; 