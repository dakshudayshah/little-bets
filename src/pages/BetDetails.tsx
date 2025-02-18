import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BetWithParticipants } from '../types';
import { betService } from '../services/betService';
import '../styles/BetDetails.css';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export const BetDetails = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [bet, setBet] = useState<BetWithParticipants | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [prediction, setPrediction] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchBet = async () => {
      if (!code) return;
      
      try {
        const betData = await betService.getBetByCode(code);
        if (!betData) {
          navigate('/not-found');
          return;
        }
        if (isMounted) {
          setBet(betData);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load bet details');
          console.error('Fetch bet error:', err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchBet();

    return () => {
      isMounted = false;
    };
  }, [code, navigate]);

  useEffect(() => {
    if (!bet?.id) return;

    let retryCount = 0;
    const maxRetries = 3;

    const setupChannel = () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }

      console.log(`Setting up channel for bet ${bet.id}`);
      
      channelRef.current = supabase
        .channel(`bet-${bet.id}-${Date.now()}`) // Add timestamp to make channel name unique
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'bet_participants',
            filter: `bet_id=eq.${bet.id}`,
          },
          async (payload) => {
            console.log('Received real-time update:', payload);
            try {
              const updatedBet = await betService.getBetByCode(bet.code_name);
              if (updatedBet) {
                console.log('Updating bet with new data:', updatedBet);
                setBet(updatedBet);
              }
            } catch (err) {
              console.error('Error fetching updated bet:', err);
              // If fetch fails and we haven't exceeded retries, try to reconnect
              if (retryCount < maxRetries) {
                retryCount++;
                setupChannel();
              }
            }
          }
        )
        .subscribe((status) => {
          console.log(`Subscription status for bet ${bet.id}:`, status);
          if (status === 'CHANNEL_ERROR' && retryCount < maxRetries) {
            retryCount++;
            setupChannel();
          }
        });
    };

    setupChannel();

    return () => {
      console.log(`Cleaning up subscription for bet ${bet.id}`);
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [bet?.id, bet?.code_name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bet) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await betService.addParticipant(bet.id, name, prediction);
      
      // Immediately fetch updated data
      const updatedBet = await betService.getBetByCode(bet.code_name);
      if (updatedBet) {
        setBet(updatedBet);
      }
      
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
      </div>
    </div>
  );
}; 