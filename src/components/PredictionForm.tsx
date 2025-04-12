import { useState, FormEvent } from 'react';
import { addBetParticipant, Bet } from '../lib/supabase';
import { PostgrestError } from '@supabase/supabase-js';
import '../styles/PredictionForm.css';

interface PredictionFormProps {
  bet: Bet;
  onSuccess: () => void;
}

export const PredictionForm = ({ bet, onSuccess }: PredictionFormProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [prediction, setPrediction] = useState<boolean | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (selectedOption === null || prediction === null) {
      setError('Please make a prediction');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const predictionData = {
        bet_id: bet.id,
        name: name.trim(),
        option_index: selectedOption,
        prediction: prediction
      };

      console.log('Submitting prediction:', predictionData);

      const { data, error: submitError } = await addBetParticipant(predictionData);

      if (submitError) {
        // Handle unique constraint violation
        if (
          (submitError as PostgrestError).code === '23505' && 
          (submitError as PostgrestError).message?.includes('unique_user_bet_prediction')
        ) {
          throw new Error('You have already submitted a prediction for this bet');
        }
        throw submitError;
      }

      if (!data) {
        throw new Error('No response from server');
      }
      
      onSuccess();
      setName('');
      setSelectedOption(null);
      setPrediction(null);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit prediction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderYesNoOptions = () => (
    <div className="prediction-buttons">
      <button
        type="button"
        className={`prediction-button yes ${prediction === true ? 'selected' : ''}`}
        onClick={() => setPrediction(true)}
        disabled={loading}
      >
        Yes
      </button>
      <button
        type="button"
        className={`prediction-button no ${prediction === false ? 'selected' : ''}`}
        onClick={() => setPrediction(false)}
        disabled={loading}
      >
        No
      </button>
    </div>
  );

  const renderMultipleChoiceOptions = () => (
    <div className="options-group">
      {bet.options.map((option: any, index: number) => (
        <div 
          key={index} 
          className={`option-card ${selectedOption === index ? 'selected' : ''}`}
          onClick={() => {
            setSelectedOption(index);
            setPrediction(true); // In multiple choice, we always set prediction to true
          }}
        >
          <div className="option-header">
            <span className="option-text">{option.text}</span>
          </div>
        </div>
      ))}
    </div>
  );

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
          autoComplete="off"
        />
      </div>

      {bet.bettype === 'yesno' ? (
        <>
          <div className="option-card">
            <div className="option-header">
              <span className="option-text">{bet.options[0]?.text}</span>
            </div>
            {renderYesNoOptions()}
          </div>
        </>
      ) : (
        renderMultipleChoiceOptions()
      )}

      <button 
        type="submit" 
        className="submit-button" 
        disabled={loading || !name || (bet.bettype === 'yesno' ? prediction === null : selectedOption === null)}
      >
        {loading ? 'Submitting...' : 'Submit Prediction'}
      </button>
    </form>
  );
}; 