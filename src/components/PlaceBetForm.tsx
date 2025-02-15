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
      case 'GENDER':
        return (
          <div className="radio-group">
            <label>
              <input
                type="radio"
                value="BOY"
                checked={prediction === 'BOY'}
                onChange={(e) => setPrediction(e.target.value)}
                disabled={isSubmitting}
              />
              Boy
            </label>
            <label>
              <input
                type="radio"
                value="GIRL"
                checked={prediction === 'GIRL'}
                onChange={(e) => setPrediction(e.target.value)}
                disabled={isSubmitting}
              />
              Girl
            </label>
          </div>
        );
      case 'SCALE':
        return (
          <input
            type="number"
            min="1"
            max="10"
            value={prediction}
            onChange={(e) => setPrediction(e.target.value)}
            required
            disabled={isSubmitting}
          />
        );
      case 'DURATION':
        return (
          <input
            type="number"
            min="0"
            value={prediction}
            onChange={(e) => setPrediction(e.target.value)}
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