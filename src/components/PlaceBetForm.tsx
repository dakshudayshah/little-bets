import { useState, FormEvent } from 'react';
import { BetWithParticipants } from '../types';
import { betService } from '../services/betService';

interface PlaceBetFormProps {
  bet: BetWithParticipants;
  onSubmit: (name: string, prediction: string) => Promise<void>;
}

export const PlaceBetForm = ({ bet, onSubmit }: PlaceBetFormProps) => {
  const [name, setName] = useState('');
  const [prediction, setPrediction] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  console.log('Current bet configuration:', {
    type: bet.type,
    min_value: bet.min_value,
    max_value: bet.max_value,
    unit: bet.unit,
    choice_options: bet.choice_options
  });

  // Type guard for choice options
  const hasChoiceOptions = (bet: BetWithParticipants): bet is BetWithParticipants & { choice_options: NonNullable<typeof bet.choice_options> } => {
    return bet.choice_options !== undefined;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !prediction) return;

    setIsSubmitting(true);
    try {
      await onSubmit(name, prediction);
      setName('');
      setPrediction('');
    } catch (error) {
      console.error('Error placing bet:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPredictionInput = () => {
    switch (bet.type) {
      case 'MILESTONE':
        return (
          <input
            type="number"
            min={bet.min_value}
            max={bet.max_value}
            value={prediction}
            onChange={(e) => setPrediction(e.target.value)}
            placeholder={`Enter value ${bet.unit ? `in ${bet.unit}` : ''}`}
            required
          />
        );
      case 'RATING':
        return (
          <input
            type="number"
            min={bet.min_value}
            max={bet.max_value}
            value={prediction}
            onChange={(e) => setPrediction(e.target.value)}
            required
          />
        );
      case 'CHOICE':
        return hasChoiceOptions(bet) ? (
          <select
            value={prediction}
            onChange={(e) => setPrediction(e.target.value)}
            required
          >
            <option value="">Select an option</option>
            {Object.entries(bet.choice_options).map(([key, value]) => (
              <option key={key} value={value}>
                {value}
              </option>
            ))}
          </select>
        ) : null;
      default:
        return (
          <input
            type="text"
            value={prediction}
            onChange={(e) => setPrediction(e.target.value)}
            placeholder="Enter your prediction"
            required
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="form-group">
        <label htmlFor="name">Your Name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label>Your Prediction</label>
        {renderPredictionInput()}
      </div>

      <button type="submit" className="button" disabled={isSubmitting}>
        {isSubmitting ? 'Placing Bet...' : 'Place Bet'}
      </button>
    </form>
  );
}; 