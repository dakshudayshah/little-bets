import { useState, useEffect, FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase, Bet, BetParticipant } from '../lib/supabase';
import '../styles/BetDetail.css';

export const BetDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [bet, setBet] = useState<Bet | null>(null);
  const [participants, setParticipants] = useState<BetParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [prediction, setPrediction] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const fetchBetAndParticipants = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Fetch bet details
        const { data: betData, error: betError } = await supabase
          .from('bets')
          .select('*')
          .eq('id', id)
          .single();
        
        if (betError) throw betError;
        
        // Fetch participants
        const { data: participantsData, error: participantsError } = await supabase
          .from('bet_participants')
          .select('*')
          .eq('bet_id', id)
          .order('created_at', { ascending: false });
        
        if (participantsError) throw participantsError;
        
        setBet(betData);
        setParticipants(participantsData || []);
      } catch (err) {
        console.error('Error fetching bet details:', err);
        setError('Failed to load bet details');
      } finally {
        setLoading(false);
      }
    };

    fetchBetAndParticipants();
  }, [id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess(false);
    setIsSubmitting(true);
    
    if (!bet || !id) return;
    
    try {
      // Validate prediction based on bet type
      if (bet.bettype === 'yesno' && prediction !== 'yes' && prediction !== 'no') {
        throw new Error('Prediction must be "yes" or "no"');
      }
      
      if (bet.bettype === 'number' && !/^\d+$/.test(prediction)) {
        throw new Error('Prediction must be a number');
      }
      
      if (bet.bettype === 'custom' && 
          prediction !== bet.customoption1 && 
          prediction !== bet.customoption2) {
        throw new Error('Prediction must be one of the options');
      }
      
      // Submit prediction
      const { error: submitError } = await supabase
        .from('bet_participants')
        .insert({
          bet_id: id,
          name,
          prediction
        });
      
      if (submitError) throw submitError;
      
      // Reset form and show success
      setName('');
      setPrediction('');
      setSubmitSuccess(true);
      
      // Refresh participants list
      const { data: refreshedData } = await supabase
        .from('bet_participants')
        .select('*')
        .eq('bet_id', id)
        .order('created_at', { ascending: false });
      
      if (refreshedData) {
        setParticipants(refreshedData);
      }
      
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit prediction');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to render bet options based on type
  const renderPredictionInput = () => {
    if (!bet) return null;

    switch (bet.bettype) {
      case 'yesno':
        return (
          <div className="prediction-options">
            <label className="radio-label">
              <input
                type="radio"
                name="prediction"
                value="yes"
                checked={prediction === 'yes'}
                onChange={() => setPrediction('yes')}
                required
              />
              Yes
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="prediction"
                value="no"
                checked={prediction === 'no'}
                onChange={() => setPrediction('no')}
                required
              />
              No
            </label>
          </div>
        );
      case 'number':
        return (
          <div className="prediction-input">
            <input 
              type="number" 
              min="0" 
              value={prediction}
              onChange={(e) => setPrediction(e.target.value)}
              placeholder={`Enter number of ${bet.unit || 'units'}`}
              required
              className="number-input"
            />
          </div>
        );
      case 'custom':
        return (
          <div className="prediction-options">
            {bet.customoption1 && (
              <label className="radio-label">
                <input
                  type="radio"
                  name="prediction"
                  value={bet.customoption1}
                  checked={prediction === bet.customoption1}
                  onChange={() => setPrediction(bet.customoption1 || '')}
                  required
                />
                {bet.customoption1}
              </label>
            )}
            {bet.customoption2 && (
              <label className="radio-label">
                <input
                  type="radio"
                  name="prediction"
                  value={bet.customoption2}
                  checked={prediction === bet.customoption2}
                  onChange={() => setPrediction(bet.customoption2 || '')}
                  required
                />
                {bet.customoption2}
              </label>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="loading">Loading bet details...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <Link to="/bets" className="back-button">Back to All Bets</Link>
      </div>
    );
  }

  if (!bet) {
    return (
      <div className="error-container">
        <p>Bet not found</p>
        <Link to="/bets" className="back-button">Back to All Bets</Link>
      </div>
    );
  }

  return (
    <div className="bet-detail-container">
      <div className="bet-header">
        <h1>{bet.question}</h1>
        <div className="bet-meta">
          <span className="bet-type">{bet.bettype.toUpperCase()}</span>
          <span className="bet-creator">Created by {bet.creator_name}</span>
          <span className="bet-date">
            {new Date(bet.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      {bet.description && (
        <div className="bet-description">
          <h2>Description</h2>
          <p>{bet.description}</p>
        </div>
      )}

      <div className="bet-interaction">
        <h2>Make Your Prediction</h2>
        
        {submitError && <div className="error-message">{submitError}</div>}
        {submitSuccess && <div className="success-message">Your prediction has been submitted!</div>}
        
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
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label>Your Prediction</label>
            {renderPredictionInput()}
          </div>
          
          <button 
            type="submit" 
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Prediction'}
          </button>
        </form>
      </div>

      <div className="participants-section">
        <h2>Predictions ({participants.length})</h2>
        
        {participants.length === 0 ? (
          <p className="no-participants">No predictions yet. Be the first!</p>
        ) : (
          <div className="participants-list">
            {participants.map(participant => (
              <div key={participant.id} className="participant-card">
                <div className="participant-name">{participant.name}</div>
                <div className="participant-prediction">
                  Prediction: <strong>{participant.prediction}</strong>
                </div>
                <div className="participant-date">
                  {new Date(participant.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bet-actions">
        <Link to="/bets" className="back-button">Back to All Bets</Link>
      </div>
    </div>
  );
}; 