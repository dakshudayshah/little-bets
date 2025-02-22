import { useState } from 'react';
import { BetWithParticipants } from '../types';
import { betService } from '../services/betService';

interface PlaceBetFormProps {
  bet: BetWithParticipants;
}

export const PlaceBetForm = ({ bet }: PlaceBetFormProps) => {
  const [name, setName] = useState('');
  const [prediction, setPrediction] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  console.log('Current bet configuration:', {
    type: bet.type,
    min_value: bet.min_value,
    max_value: bet.max_value,
    unit: bet.unit,
    choice_options: bet.choice_options
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await betService.addParticipant(bet.id, name, prediction);
      // Real-time will handle the update
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
          <div className="duration-input">
            <input
              type="number"
              min={bet.min_value || 0}
              max={bet.max_value}
              value={prediction}
              onChange={(e) => setPrediction(e.target.value)}
              required
              disabled={isSubmitting}
            />
            <span className="unit">{bet.unit}</span>
          </div>
        );

      case 'RATING':
        return (
          <div className="range-input">
            <input
              type="range"
              min={bet.min_value || 1}
              max={bet.max_value || 10}
              value={prediction}
              onChange={(e) => setPrediction(e.target.value)}
              required
              disabled={isSubmitting}
            />
            <span className="range-value">{prediction}</span>
          </div>
        );

      case 'CHOICE':
        if (!bet.choice_options) return null;
        return (
          <div className="choice-group">
            {Object.entries(bet.choice_options).map(([key, value]) => (
              <label key={key}>
                <input
                  type="radio"
                  value={key}
                  checked={prediction === key}
                  onChange={(e) => setPrediction(e.target.value)}
                  disabled={isSubmitting}
                />
                {value}
              </label>
            ))}
          </div>
        );

      case 'WORD':
        return (
          <input
            type="text"
            value={prediction}
            onChange={(e) => setPrediction(e.target.value)}
            placeholder="Enter one word"
            maxLength={30}
            pattern="\S+"
            title="Please enter a single word (no spaces)"
            required
            disabled={isSubmitting}
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