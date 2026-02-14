import { useState } from 'react';
import { submitPrediction } from '../lib/supabase';
import type { Bet } from '../types';
import '../styles/PredictionForm.css';

interface PredictionFormProps {
  bet: Bet;
  onPredictionSubmitted: () => void;
}

function PredictionForm({ bet, onPredictionSubmitted }: PredictionFormProps) {
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handlePredict(prediction: boolean, optionIndex: number) {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please enter your name');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await submitPrediction({
        bet_id: bet.id,
        participant_name: trimmedName,
        prediction,
        option_index: optionIndex,
      });
      setSubmitted(true);
      onPredictionSubmitted();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit prediction';
      if (message.includes('duplicate') || message.includes('unique')) {
        setError('You have already made a prediction on this bet');
      } else {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="prediction-form">
        <p className="prediction-success">Your prediction has been recorded!</p>
      </div>
    );
  }

  return (
    <div className="prediction-form">
      <h3 className="prediction-title">Make Your Prediction</h3>
      <div className="form-group">
        <input
          className="form-input"
          type="text"
          placeholder="Your name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>

      {error && <p className="form-error">{error}</p>}

      {bet.bet_type === 'yesno' ? (
        <div className="prediction-buttons">
          <button
            className="predict-btn yes"
            onClick={() => handlePredict(true, 0)}
            disabled={submitting}
          >
            Yes
          </button>
          <button
            className="predict-btn no"
            onClick={() => handlePredict(false, 0)}
            disabled={submitting}
          >
            No
          </button>
        </div>
      ) : (
        <div className="prediction-options">
          {bet.options.map((option, index) => (
            <button
              key={index}
              className="predict-option-btn"
              onClick={() => handlePredict(true, index)}
              disabled={submitting}
            >
              {option.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default PredictionForm;
