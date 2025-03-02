import { FormEvent, useState } from 'react';
import { Bet } from '../lib/supabase';
import '../styles/PredictionForm.css';

interface PredictionFormProps {
  bet: Bet;
  onSubmit: (name: string, prediction: string) => Promise<void>;
  submitError?: string;
  submitSuccess?: boolean;
  isSubmitting?: boolean;
}

export const PredictionForm = ({ 
  bet, 
  onSubmit,
  submitError = '',
  submitSuccess = false,
  isSubmitting = false
}: PredictionFormProps) => {
  const [name, setName] = useState('');
  const [prediction, setPrediction] = useState('');
  
  // Validate prediction based on bet type
  const validatePrediction = (value: string): boolean => {
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

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!name.trim() || !prediction.trim() || !validatePrediction(prediction)) {
      return;
    }
    
    await onSubmit(name, prediction);
    
    // Reset form on successful submission
    if (!submitError) {
      setName('');
      setPrediction('');
    }
  };

  const renderPredictionInput = () => {
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

  return (
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
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Prediction'}
        </button>
      </form>
    </div>
  );
}; 