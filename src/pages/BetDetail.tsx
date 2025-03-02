import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Bet, BetParticipant, fetchBetByCodeName, fetchBetParticipants, addBetParticipant } from '../lib/supabase';
import { formatDate, capitalizeFirstLetter } from '../utils/helpers';
import { PredictionForm } from '../components/PredictionForm';
import '../styles/BetDetail.css';

// Component for displaying bet information
const BetInfo = ({ bet, participantsCount }: { bet: Bet; participantsCount: number }) => (
  <div className="bet-info">
    <div className="info-item">
      <span className="label">Created by</span>
      <span className="value">{bet.creator_name}</span>
    </div>
    
    <div className="info-item">
      <span className="label">Type</span>
      <span className="value">{capitalizeFirstLetter(bet.bettype)}</span>
    </div>
    
    <div className="info-item">
      <span className="label">Predictions</span>
      <span className="value">{participantsCount}</span>
    </div>
  </div>
);

// Component for displaying current predictions
const PredictionsList = ({ participants }: { participants: BetParticipant[] }) => (
  <div className="current-predictions">
    <h2>Current Predictions</h2>
    
    {participants.length === 0 ? (
      <p className="no-predictions">No predictions yet. Be the first!</p>
    ) : (
      <ul className="predictions-list">
        {participants.map((participant) => (
          <li key={participant.id} className="prediction-item">
            <div className="participant-name">{participant.name}</div>
            <div className="participant-prediction">{participant.prediction}</div>
            <div className="prediction-date">
              {formatDate(participant.created_at)}
            </div>
          </li>
        ))}
      </ul>
    )}
  </div>
);

// Main BetDetail component
export const BetDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [bet, setBet] = useState<Bet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [participants, setParticipants] = useState<BetParticipant[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fetch bet and participants data
  const fetchBetData = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError('');
      
      // Fetch the bet
      const { data: betData, error: betError } = await fetchBetByCodeName(id);
      
      if (betError) throw betError;
      if (!betData) throw new Error('Bet not found');
      
      setBet(betData);
      
      // Fetch participants
      const { data: participantsData, error: participantsError } = await fetchBetParticipants(betData.id);
      
      if (participantsError) throw participantsError;
      setParticipants(participantsData || []);
      
    } catch (err) {
      console.error('Error fetching bet:', err);
      setError('Failed to load bet details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBetData();
  }, [fetchBetData]);

  // Handle prediction submission
  const handleSubmitPrediction = async (name: string, prediction: string) => {
    if (!bet) return;
    
    setSubmitError('');
    setSubmitSuccess(false);
    
    try {
      setSubmitting(true);
      
      // Insert new prediction
      const { error: insertError } = await addBetParticipant({
        bet_id: bet.id,
        name,
        prediction
      });
      
      if (insertError) throw insertError;
      
      // Refresh participants list
      const { data: newParticipants, error: fetchError } = await fetchBetParticipants(bet.id);
      
      if (fetchError) throw fetchError;
      
      setParticipants(newParticipants || []);
      setSubmitSuccess(true);
      
    } catch (err) {
      console.error('Error submitting prediction:', err);
      setSubmitError('Failed to submit your prediction');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return <div className="loading">Loading bet details...</div>;
  }

  // Error state
  if (error || !bet) {
    return <div className="error">{error || 'Bet not found'}</div>;
  }

  // Render the component
  return (
    <div className="bet-detail-container">
      <h1>{bet.question}</h1>
      
      <BetInfo bet={bet} participantsCount={participants.length} />
      
      {bet.description && (
        <div className="bet-description">
          <p>{bet.description}</p>
        </div>
      )}
      
      <PredictionForm
        bet={bet}
        onSubmit={handleSubmitPrediction}
        submitError={submitError}
        submitSuccess={submitSuccess}
        isSubmitting={submitting}
      />
      
      <PredictionsList participants={participants} />
    </div>
  );
};