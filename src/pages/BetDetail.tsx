import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Bet, BetParticipant, fetchBetByCodeName, fetchBetParticipants, BET_TYPE_NAMES } from '../lib/supabase';
import { PredictionForm } from '../components/PredictionForm';
import '../styles/BetDetail.css';

export const BetDetail = () => {
  const { id: codeName } = useParams();
  const [bet, setBet] = useState<Bet | null>(null);
  const [participants, setParticipants] = useState<BetParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!codeName) return;
      
      try {
        setLoading(true);
        setError('');
        
        const betResult = await fetchBetByCodeName(codeName);
        if (betResult.error) throw betResult.error;
        if (!betResult.data) throw new Error('Bet not found');
        
        setBet(betResult.data);
        
        const participantsResult = await fetchBetParticipants(betResult.data.id);
        if (participantsResult.error) throw participantsResult.error;
        
        setParticipants(participantsResult.data || []);
        
      } catch (err) {
        console.error('Error fetching bet details:', err);
        setError('Failed to load bet details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [codeName]);

  useEffect(() => {
    if (!bet) return;
    
    // Set up polling as a fallback
    const pollInterval = setInterval(() => {
      fetchBetParticipants(bet.id).then(result => {
        if (!result.error) {
          setParticipants(result.data || []);
        }
      });
    }, 5000); // Poll every 5 seconds
    
    // Clean up on unmount
    return () => clearInterval(pollInterval);
  }, [bet]);

  const shareBet = async () => {
    if (!bet) return;
    
    const shareText = `Join me in predicting: ${bet.question} on Little Bets!`;
    const shareUrl = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: bet.question,
          text: shareText,
          url: shareUrl
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setShowCopiedMessage(true);
      setTimeout(() => setShowCopiedMessage(false), 2000);
    }
  };

  if (loading) return <div className="loading-state">Loading bet details...</div>;
  if (error) return <div className="error-state">{error}</div>;
  if (!bet) return <div className="error-state">Bet not found</div>;

  return (
    <div className="bet-detail-container">
      <div className="bet-header">
        <div className="bet-type">{BET_TYPE_NAMES[bet.bettype]}</div>
        <h1>{bet.question}</h1>
        <div className="bet-meta">
          <span>Created by {bet.creator_name}</span>
          <span>{participants.length} predictions</span>
        </div>
        <button onClick={shareBet} className="share-button" aria-label="Share bet">
          Share 📤
        </button>
      </div>

      {showCopiedMessage && (
        <div className="copied-message">Link copied to clipboard!</div>
      )}

      {bet.description && (
        <div className="bet-description">
          {bet.description}
        </div>
      )}

      <div className="predictions-section">
        <h2>Make Your Prediction</h2>
        <PredictionForm 
          bet={bet} 
          onSuccess={() => {
            // Refresh participants after new prediction
            fetchBetParticipants(bet.id).then(result => {
              if (!result.error) setParticipants(result.data || []);
            });
          }} 
        />
      </div>

      <div className="participants-section">
        <h2>Current Predictions</h2>
        {participants.length === 0 ? (
          <div className="empty-state">No predictions yet. Be the first!</div>
        ) : (
          <div className="predictions-list">
            {participants.map(participant => (
              <div key={participant.id} className="prediction-item">
                <span className="participant-name">{participant.name}</span>
                <span className="prediction-value">{participant.prediction}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};