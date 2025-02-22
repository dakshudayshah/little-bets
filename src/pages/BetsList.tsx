import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BetWithParticipants, BetType } from '../types';
import { betService } from '../services/betService';
import '../styles/BetsList.css';

const formatBetTypeInfo = (bet: BetWithParticipants) => {
  switch (bet.type) {
    case 'MILESTONE':
      if (!bet.participants.length) return 'No predictions yet';
      const validMilestonePredictions = bet.participants
        .map(p => Number(p.prediction))
        .filter(n => !isNaN(n));
      if (!validMilestonePredictions.length) return 'No valid predictions yet';
      const milestoneAvg = validMilestonePredictions.reduce((a, b) => a + b, 0) / validMilestonePredictions.length;
      return `Average: ${milestoneAvg.toFixed(1)} ${bet.unit || 'units'} (${bet.min_value}-${bet.max_value} ${bet.unit})`;
    
    case 'RATING':
      if (!bet.participants.length) return 'No predictions yet';
      const validRatingPredictions = bet.participants
        .map(p => Number(p.prediction))
        .filter(n => !isNaN(n));
      if (!validRatingPredictions.length) return 'No valid predictions yet';
      const ratingAvg = validRatingPredictions.reduce((a, b) => a + b, 0) / validRatingPredictions.length;
      return `Average rating: ${ratingAvg.toFixed(1)} out of ${bet.max_value}`;
    
    case 'CHOICE':
      if (!bet.participants.length) return 'No votes yet';
      if (!bet.choice_options) return 'Options not available';
      
      const counts = bet.participants.reduce((acc, p) => {
        acc[p.prediction] = (acc[p.prediction] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const topChoice = Object.entries(bet.choice_options)
        .map(([key, value]) => ({ key, value, count: counts[key] || 0 }))
        .sort((a, b) => b.count - a.count)[0];
      
      return `Leading: ${topChoice.value} (${topChoice.count} votes)`;
    
    case 'WORD':
      const wordCount = bet.participants.length;
      return `${wordCount} ${wordCount === 1 ? 'response' : 'responses'}`;
    
    default:
      return 'No predictions yet';
  }
};

const formatBetType = (type: BetType) => {
  switch (type) {
    case 'MILESTONE':
      return 'Milestone';
    case 'RATING':
      return 'Rating';
    case 'CHOICE':
      return 'Multiple Choice';
    case 'WORD':
      return 'Word';
    default:
      return type;
  }
};

const formatDate = (date: string) => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  return new Date(date).toLocaleDateString(undefined, options);
};

export const BetsList = () => {
  const [bets, setBets] = useState<BetWithParticipants[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);

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

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingFeedback(true);

    // Using mailto link as a simple solution
    const subject = encodeURIComponent('Little Bets - Feature Request');
    const body = encodeURIComponent(feedback);
    window.location.href = `mailto:daksh.uday.shah@gmail.com?subject=${subject}&body=${body}`;

    setFeedback('');
    setFeedbackSent(true);
    setIsSendingFeedback(false);
  };

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
              <div className="bet-header">
                <h2>{bet.question}</h2>
                <span className={`bet-type ${bet.type.toLowerCase()}`}>
                  {formatBetType(bet.type)}
                </span>
              </div>
              <p className="bet-creator">Created by {bet.creator_name}</p>
              <p className="bet-stats">{formatBetTypeInfo(bet)}</p>
              <div className="bet-footer">
                <p className="bet-participants">
                  {bet.participants.length} predictions
                </p>
                <p className="bet-date">
                  {formatDate(bet.created_at)}
                </p>
              </div>
            </Link>
          ))}

          {!error && bets.length === 0 && (
            <p className="no-bets">
              No bets yet. <Link to="/create">Create one!</Link>
            </p>
          )}
        </div>

        <div className="feedback-section">
          <h2>Feature Request</h2>
          <form onSubmit={handleFeedbackSubmit} className="feedback-form">
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Want to create a specific bet or have a feature request? Let us know!"
              required
              disabled={isSendingFeedback}
            />
            <button 
              type="submit" 
              className="button"
              disabled={isSendingFeedback || !feedback.trim()}
            >
              {isSendingFeedback ? 'Sending...' : 'Send Feedback'}
            </button>
          </form>
          {feedbackSent && (
            <p className="feedback-success">
              Thanks for your feedback! We'll get back to you soon.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}; 