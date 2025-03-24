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

  const getBetOptions = () => {
    switch (bet.bettype) {
      case 'yesno':
        return 'Yes or No';
      case 'custom':
        return bet.customoption1 && bet.customoption2 
          ? `${bet.customoption1} or ${bet.customoption2}`
          : 'Multiple options';
      default:
        return '';
    }
  };

  return (
    <div className="bet-detail-container">
      <div className="bet-header">
        <button onClick={() => navigate('/')} className="back-button">
          ← Back
        </button>
        <h1>{bet.question}</h1>
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

        <div className="bet-options">
          <h2>Options</h2>
          <p>{getBetOptions()}</p>
        </div>
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