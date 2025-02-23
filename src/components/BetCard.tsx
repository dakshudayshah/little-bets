import { Link } from 'react-router-dom';
import { Bet } from '../types';
import '../styles/BetsList.css';

const ShareIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
    <polyline points="16 6 12 2 8 6"/>
    <line x1="12" y1="2" x2="12" y2="15"/>
  </svg>
);

interface BetCardProps {
  bet: Bet;
}

export const BetCard = ({ bet }: BetCardProps) => {
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/bets/${bet.code_name}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: bet.question,
          text: `Check out this bet: ${bet.question}`,
          url: shareUrl
        });
      } catch (err) {
        // Fallback to copying to clipboard
        copyToClipboard(shareUrl);
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };

  return (
    <div className="bet-card">
      <div className="bet-content">
        <Link to={`/bets/${bet.code_name}`} className="bet-link">
          <h3>{bet.question}</h3>
          <div className="bet-meta">
            <span>Created by {bet.creator_name}</span>
            <span>{bet.participants?.length || 0} predictions</span>
          </div>
        </Link>
        <button onClick={handleShare} className="share-button" aria-label="Share bet">
          <ShareIcon />
        </button>
      </div>
    </div>
  );
}; 