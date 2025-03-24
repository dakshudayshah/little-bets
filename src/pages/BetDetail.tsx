import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bet, BetParticipant, fetchBetByCodeName, fetchBetParticipants, BET_TYPE_NAMES } from '../lib/supabase';
import { PredictionForm } from '../components/PredictionForm';
import { formatDate } from '../utils/helpers';
import '../styles/BetDetail.css';

export const BetDetail = () => {
  const { id: codeName } = useParams();
  const navigate = useNavigate();
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

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Loading bet details...</p>
      </div>
    );
  }

  if (error || !bet) {
    return (
      <div className="error-state">
        <p>{error || 'Bet not found'}</p>
        <button onClick={() => navigate('/')} className="back-button">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="bet-detail-container">
      <div className="bet-header">
        <div className="header-content">
          <h1>{bet.question}</h1>
          <button onClick={shareBet} className="share-button" aria-label="Share bet">
            Share 📤
          </button>
        </div>
        {showCopiedMessage && (
          <div className="copied-message">Link copied to clipboard!</div>
        )}
      </div>

      <div className="bet-info">
        <div className="bet-meta">
          <span className="bet-creator">Created by {bet.creator_name}</span>
          <span className="bet-type">{BET_TYPE_NAMES[bet.bettype]}</span>
          <span className="bet-date">{formatDate(bet.created_at)}</span>
        </div>

        {bet.description && (
          <div className="bet-description">
            <h2>Description</h2>
            <p>{bet.description}</p>
          </div>
        )}
      </div>

      <div className="predictions-section">
        <h2>Predictions ({participants.length})</h2>
        <PredictionForm bet={bet} onSuccess={() => {
          fetchBetParticipants(bet.id).then(result => {
            if (!result.error) {
              setParticipants(result.data || []);
            }
          });
        }} />
        
        {participants.length > 0 ? (
          <div className="predictions-list">
            {participants.map((participant) => (
              <div key={participant.id} className="prediction-card">
                <span className="participant-name">{participant.name}</span>
                <span className="prediction-value">{participant.prediction}</span>
                <span className="prediction-date">
                  {formatDate(participant.created_at)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-predictions">No predictions yet. Be the first!</p>
        )}
      </div>
    </div>
  );
};

const PredictionChart = ({ participants, bet }) => {
  // Count predictions per option
  const counts = participants.reduce((acc, p) => {
    acc[p.prediction] = (acc[p.prediction] || 0) + 1;
    return acc;
  }, {});
  
  const totalCount = participants.length;
  
  return (
    <div className="prediction-chart">
      <h3>Prediction Distribution</h3>
      {Object.entries(counts).map(([prediction, count]) => (
        <div key={prediction} className="chart-row">
          <div className="prediction-label">{prediction}</div>
          <div className="prediction-bar-container">
            <div 
              className="prediction-bar"
              style={{ width: `${(count / totalCount) * 100}%` }}
            ></div>
            <span className="prediction-count">{count}</span>
          </div>
        </div>
      ))}
    </div>
  );
}