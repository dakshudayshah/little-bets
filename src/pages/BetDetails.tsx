import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BetWithParticipants } from '../types';
import { betService } from '../services/betService';
import '../styles/BetDetails.css';

export const BetDetails = () => {
  const { code_name } = useParams<{ code_name: string }>();
  const [bet, setBet] = useState<BetWithParticipants | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [prediction, setPrediction] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchBet = async () => {
      if (!code_name) return;
      try {
        const betData = await betService.getBetByCode(code_name);
        setBet(betData);
      } catch (err) {
        setError('Failed to load bet details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBet();
  }, [code_name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bet || !name || !prediction) return;

    setIsSubmitting(true);
    try {
      await betService.addParticipant(bet.id, name, prediction);
      const updatedBet = await betService.getBetByCode(code_name!);
      setBet(updatedBet);
      setName('');
      setPrediction('');
    } catch (err) {
      setError('Failed to submit prediction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const shareUrl = `${window.location.origin}/bets/${bet?.code_name}`;

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    // Could add a toast notification here
  };

  if (isLoading) return <div className="container">Loading...</div>;
  if (error) return <div className="container error">{error}</div>;
  if (!bet) return <div className="container">Bet not found</div>;

  return (
    <div className="container">
      <div className="bet-details">
        <h1>{bet.question}</h1>
        {bet.description && <p className="description">{bet.description}</p>}
        
        <div className="share-section">
          <div className="share-link">
            <span>Share Link:</span>
            <code>{shareUrl}</code>
            <button onClick={copyShareLink} className="copy-button">
              Copy
            </button>
          </div>
        </div>

        <div className="stats">
          <div className="stat-item">
            <span>Created by</span>
            <strong>{bet.creator_name}</strong>
          </div>
          <div className="stat-item">
            <span>Predictions</span>
            <strong>{bet.participants.length}</strong>
          </div>
          <div className="stat-item">
            <span>Type</span>
            <strong>{bet.type}</strong>
          </div>
        </div>

        <div className="predictions-section">
          <h2>Make Your Prediction</h2>
          <form onSubmit={handleSubmit} className="prediction-form">
            <div className="form-group">
              <label htmlFor="name">Your Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="prediction">Your Prediction</label>
              <input
                id="prediction"
                type="text"
                value={prediction}
                onChange={(e) => setPrediction(e.target.value)}
                placeholder="Enter your prediction"
                required
                disabled={isSubmitting}
              />
            </div>

            <button type="submit" className="submit-button" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Prediction'}
            </button>
          </form>

          <h2>Current Predictions</h2>
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
        </div>
      </div>
    </div>
  );
}; 