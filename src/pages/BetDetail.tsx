import { useState, useEffect, FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Bet } from '../lib/supabase';
import '../styles/BetDetail.css';

export const BetDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [bet, setBet] = useState<Bet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [participants, setParticipants] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [prediction, setPrediction] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const fetchBet = async () => {
      try {
        setLoading(true);
        
        // Fetch the bet
        const { data: betData, error: betError } = await supabase
          .from('bets')
          .select('*')
          .eq('code_name', id)
          .single();
        
        if (betError) throw betError;
        setBet(betData);
        
        // Fetch participants
        const { data: participantsData, error: participantsError } = await supabase
          .from('bet_participants')
          .select('*')
          .eq('bet_id', betData.id)
          .order('created_at', { ascending: false });
        
        if (participantsError) throw participantsError;
        setParticipants(participantsData);
        
      } catch (err) {
        console.error('Error fetching bet:', err);
        setError('Failed to load bet details');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchBet();
    }
  }, [id]);

  const validatePrediction = (value: string): boolean => {
    if (!bet) return false;
    
    switch (bet.bettype) {
      case 'yesno':
        return value.toLowerCase() === 'yes' || value.toLowerCase() === 'no';
      case 'number':
        return !isNaN(Number(value));
      case 'custom':
        return value === bet.customoption1 || value === bet.customoption2;
      default:
        return true;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess(false);
    
    if (!name.trim()) {
      setSubmitError('Please enter your name');
      return;
    }
    
    if (!prediction.trim()) {
      setSubmitError('Please enter your prediction');
      return;
    }
    
    if (!validatePrediction(prediction)) {
      setSubmitError('Invalid prediction for this bet type');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const { error: insertError } = await supabase
        .from('bet_participants')
        .insert({
          bet_id: bet?.id,
          name,
          prediction
        });
      
      if (insertError) throw insertError;
      
      // Refresh participants list
      const { data: newParticipants, error: fetchError } = await supabase
        .from('bet_participants')
        .select('*')
        .eq('bet_id', bet?.id)
        .order('created_at', { ascending: false });
      
      if (fetchError) throw fetchError;
      
      setParticipants(newParticipants);
      setName('');
      setPrediction('');
      setSubmitSuccess(true);
      
    } catch (err) {
      console.error('Error submitting prediction:', err);
      setSubmitError('Failed to submit your prediction');
    } finally {
      setSubmitting(false);
    }
  };

  const renderPredictionInput = () => {
    if (!bet) return null;
    
    switch (bet.bettype) {
      case 'yesno':
        return (
          <div className="form-group">
            <label htmlFor="prediction">Your Prediction</label>
            <select
              id="prediction"
              value={prediction}
              onChange={(e) => setPrediction(e.target.value)}
              required
              className="form-input"
            >
              <option value="">Select...</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
        );
      
      case 'number':
        return (
          <div className="form-group">
            <label htmlFor="prediction">Your Prediction ({bet.unit})</label>
            <input
              id="prediction"
              type="number"
              value={prediction}
              onChange={(e) => setPrediction(e.target.value)}
              placeholder={`Enter a number (${bet.unit})`}
              required
              className="form-input"
            />
          </div>
        );
      
      case 'custom':
        return (
          <div className="form-group">
            <label htmlFor="prediction">Your Prediction</label>
            <select
              id="prediction"
              value={prediction}
              onChange={(e) => setPrediction(e.target.value)}
              required
              className="form-input"
            >
              <option value="">Select...</option>
              <option value={bet.customoption1}>{bet.customoption1}</option>
              <option value={bet.customoption2}>{bet.customoption2}</option>
            </select>
          </div>
        );
      
      default:
        return (
          <div className="form-group">
            <label htmlFor="prediction">Your Prediction</label>
            <input
              id="prediction"
              type="text"
              value={prediction}
              onChange={(e) => setPrediction(e.target.value)}
              placeholder="Enter your prediction"
              required
              className="form-input"
            />
          </div>
        );
    }
  };

  if (loading) {
    return <div className="loading">Loading bet details...</div>;
  }

  if (error || !bet) {
    return <div className="error">{error || 'Bet not found'}</div>;
  }

  return (
    <div className="bet-detail-container">
      <h1>{bet.question}</h1>
      
      <div className="bet-info">
        <div className="info-item">
          <span className="label">Created by</span>
          <span className="value">{bet.creator_name}</span>
        </div>
        
        <div className="info-item">
          <span className="label">Type</span>
          <span className="value">{bet.bettype.charAt(0).toUpperCase() + bet.bettype.slice(1)}</span>
        </div>
        
        <div className="info-item">
          <span className="label">Predictions</span>
          <span className="value">{participants.length}</span>
        </div>
      </div>
      
      {bet.description && (
        <div className="bet-description">
          <p>{bet.description}</p>
        </div>
      )}
      
      <div className="make-prediction">
        <h2>Make Your Prediction</h2>
        
        {submitError && <div className="error-message">{submitError}</div>}
        {submitSuccess && <div className="success-message">Your prediction has been recorded!</div>}
        
        <form onSubmit={handleSubmit}>
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
          
          {renderPredictionInput()}
          
          <button 
            type="submit" 
            className="submit-button"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Prediction'}
          </button>
        </form>
      </div>
      
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
                  {new Date(participant.created_at).toLocaleDateString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};