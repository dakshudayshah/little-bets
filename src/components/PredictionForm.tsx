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
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [prediction, setPrediction] = useState<'yes' | 'no' | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (selectedOption === null || !prediction) {
      setError('Please make a prediction');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Log the bet data for debugging
      console.log('Current bet:', bet);
      
      // Simplified prediction data
      const predictionData = {
        bet_id: bet.id,
        name: name.trim(),
        option_index: selectedOption,
        prediction: prediction // Just 'yes' or 'no'
      };

      console.log('Submitting prediction:', predictionData);

      const { data, error: submitError } = await addBetParticipant(predictionData);

      if (submitError) {
        console.error('Submit error:', submitError);
        setError(submitError.message || 'Failed to submit prediction');
        return;
      }

      if (!data) {
        console.error('No data returned from submission');
        setError('No response from server');
        return;
      }
      
      console.log('Prediction submitted successfully:', data);
      
      // Clear form and show success
      onSuccess();
      setName('');
      setSelectedOption(null);
      setPrediction(null);
      
    } catch (err) {
      console.error('Error submitting prediction:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit prediction. Please try again.');
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

      <div className="options-group">
        {bet.options.map((option, index) => (
          <div 
            key={index} 
            className={`option-card ${selectedOption === index ? 'selected' : ''}`}
            onClick={() => setSelectedOption(index)}
          >
            <div className="option-header">
              <span className="option-text">{option.text}</span>
            </div>
            <div className="prediction-buttons">
              <button
                type="button"
                className={`prediction-button yes ${prediction === 'yes' && selectedOption === index ? 'selected' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedOption(index);
                  setPrediction('yes');
                }}
                disabled={loading}
              >
                Yes
              </button>
              <button
                type="button"
                className={`prediction-button no ${prediction === 'no' && selectedOption === index ? 'selected' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedOption(index);
                  setPrediction('no');
                }}
                disabled={loading}
              >
                No
              </button>
            </div>
          </div>
        ))}
      </div>

      <button 
        type="submit" 
        className="submit-button" 
        disabled={loading || !name || selectedOption === null || !prediction}
      >
        {loading ? 'Submitting...' : 'Submit Prediction'}
      </button>
    </form>
  );
}; 