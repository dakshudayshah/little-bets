import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BetWithParticipants, BetParticipant } from '../types';
import { betService } from '../services/betService';
import '../styles/BetDetails.css';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type BetParticipantPayload = {
  id: string;
  bet_id: string;
  name: string;
  prediction: string;
  created_at: string;
};

const EndBetButton = ({ bet }: { bet: BetWithParticipants }) => {
  const [isEnding, setIsEnding] = useState(false);
  const [creatorName, setCreatorName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleEndBet = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEnding(true);
    setError(null);

    try {
      await betService.endBet(bet.id, creatorName);
      // Real-time will handle the update
    } catch (err) {
      setError('Failed to end bet. Please try again.');
      console.error('End bet error:', err);
    } finally {
      setIsEnding(false);
    }
  };

  if (bet.status === 'ENDED') {
    return (
      <div className="end-bet-section">
        <p>This bet was ended by {bet.ended_by} on {new Date(bet.ended_at!).toLocaleDateString()}</p>
      </div>
    );
  }

  return (
    <div className="end-bet-section">
      <h2>End this Bet</h2>
      <form onSubmit={handleEndBet}>
        <div className="form-group">
          <label htmlFor="creatorName">Enter your name to verify you created this bet</label>
          <input
            id="creatorName"
            type="text"
            value={creatorName}
            onChange={(e) => setCreatorName(e.target.value)}
            placeholder="Enter your name"
            required
            disabled={isEnding}
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="button" disabled={isEnding}>
          {isEnding ? 'Ending Bet...' : 'End Bet'}
        </button>
      </form>
    </div>
  );
};

export const BetDetails = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [bet, setBet] = useState<BetWithParticipants | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [prediction, setPrediction] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchBet = async () => {
      if (!code) return;
      
      try {
        const betData = await betService.getBetByCode(code);
        if (!betData) {
          navigate('/not-found');
          return;
        }
        setBet(betData);
      } catch (err) {
        setError('Failed to load bet details');
        console.error('Fetch bet error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBet();

    // Only set up subscription if we have both code and bet
    let channel: RealtimeChannel | null = null;
    
    if (code && bet) {
      channel = supabase
        .channel(`bet_changes_${bet.id}`) // Add unique channel name
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'bet_participants',
            filter: `bet_id=eq.${bet.id}`,
          },
          (payload: RealtimePostgresChangesPayload<BetParticipantPayload>) => {
            const newParticipant = payload.new;
            setBet(currentBet => {
              if (!currentBet) return currentBet;
              return {
                ...currentBet,
                participants: [...currentBet.participants, newParticipant as BetParticipant]
              };
            });
          }
        )
        .subscribe();
    }

    // Clean up subscription
    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [code, navigate, bet]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bet) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await betService.addParticipant(bet.id, name, prediction);
      // No need to fetch updated bet since real-time will handle it
      setName('');
      setPrediction('');
    } catch (err) {
      setError('Failed to submit prediction. Please try again.');
      console.error('Submit prediction error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container">
        <div className="content">
          <p className="loading">Loading bet details...</p>
        </div>
      </div>
    );
  }

  if (!bet) {
    return (
      <div className="container">
        <div className="content">
          <h1>Bet not found</h1>
        </div>
      </div>
    );
  }

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
    <div className="container">
      <div className="content">
        <h1>{bet.question}</h1>
        {bet.description && <p className="description">{bet.description}</p>}
        
        <div className="share-section">
          <p>Share this bet with your friends using code: <strong>{bet.code_name}</strong></p>
          <button 
            className="button"
            onClick={() => navigator.clipboard.writeText(window.location.href)}
          >
            Copy Link
          </button>
        </div>

        <div className="predictions-section">
          <h2>Place Your Bet</h2>
          {error && <p className="error-message">{error}</p>}
          
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
              {isSubmitting ? 'Submitting...' : 'Submit Prediction'}
            </button>
          </form>

          <div className="current-predictions">
            <h2>Current Predictions</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Prediction</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {bet.participants.map((participant, index) => (
                  <tr key={index}>
                    <td>{participant.name}</td>
                    <td>{participant.prediction}</td>
                    <td>{new Date(participant.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <EndBetButton bet={bet} />
      </div>
    </div>
  );
}; 