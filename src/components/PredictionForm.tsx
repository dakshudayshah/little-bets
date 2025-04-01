import { useState, FormEvent } from 'react';
import { addBetParticipant, Bet } from '../lib/supabase';
import '../styles/PredictionForm.css';

interface PredictionFormProps {
  bet: Bet;
  onSuccess: () => void;
}

export const PredictionForm = ({ bet, onSuccess }: PredictionFormProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [prediction, setPrediction] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!name.trim()) {
      setError('Please enter your name');
      setLoading(false);
      return;
    }

    if (!prediction.trim()) {
      setError('Please make a prediction');
      setLoading(false);
      return;
    }

    try {
      const { error: submitError } = await addBetParticipant({
        bet_id: bet.id,
        name: name.trim(),
        prediction: prediction.trim()
      });

      if (submitError) throw submitError;
      
      onSuccess();
      setName('');
      setPrediction('');
      
    } catch (err) {
      console.error('Error submitting prediction:', err);
      setError('Failed to submit prediction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="prediction-form">
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-group">
        <label htmlFor="name">Your Name</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          disabled={loading}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="prediction">Your Prediction</label>
        <input
          type="text"
          id="prediction"
          value={prediction}
          onChange={(e) => setPrediction(e.target.value)}
          placeholder="Enter your prediction"
          disabled={loading}
          required
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Prediction'}
      </button>
    </form>
  );
}; 