import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bet, BetParticipant, fetchBetByCodeName, fetchBetParticipants, BET_TYPE_NAMES } from '../lib/supabase';
import { PredictionForm } from '../components/PredictionForm';
import { formatDate } from '../utils/helpers';
import '../styles/BetDetail.css';
import { supabase } from '../lib/supabase';
import { Share2 } from 'lucide-react';

export const BetDetail = () => {
  const { id: codeName } = useParams();
  const navigate = useNavigate();
  const [bet, setBet] = useState<Bet | null>(null);
  const [participants, setParticipants] = useState<BetParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!codeName) return;
      
      try {
        setLoading(true);
        setError('');
        
        const betResult = await fetchBetByCodeName(codeName);
        if (betResult.error) throw betResult.error;
        if (!betResult.data) throw new Error('Bet not found');
        
        setBet(betResult.data);
        
        const participantsResult = await fetchBetParticipants(betResult.data.id);
        if (participantsResult.error) throw participantsResult.error;
        
        setParticipants(participantsResult.data || []);
        
      } catch (err) {
        console.error('Error fetching bet details:', err);
        setError('Failed to load bet details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [codeName]);

  useEffect(() => {
    if (!bet) return;
    
    const subscription = supabase
      .from(`bet_participants:bet_id=eq.${bet.id}`)
      .on('INSERT', (payload) => {
        setParticipants(current => [payload.new, ...current]);
      })
      .subscribe();
    
    return () => {
      supabase.removeSubscription(subscription);
    };
  }, [bet]);

  const shareBet = async () => {
    if (!bet) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: bet.question,
          text: `Check out this bet: ${bet.question}`,
          url: window.location.href
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Loading bet details...</p>
      </div>
    );
  }

  if (error || !bet) {
    return (
      <div className="error-state">
        <p>{error || 'Bet not found'}</p>
        <button onClick={() => navigate('/')} className="back-button">
          Back to Home
        </button>
      </div>
    );
  }

  const getBetOptions = () => {
    switch (bet.bettype) {
      case 'yesno':
        return 'Yes or No';
      case 'custom':
        return bet.customoption1 && bet.customoption2 
          ? `${bet.customoption1} or ${bet.customoption2}`
          : 'Multiple options';
      default:
        return '';
    }
  };

  return (
    <div className="bet-detail-container">
      <div className="bet-header">
        <div className="header-content">
          <h1>{bet.question}</h1>
          <button onClick={shareBet} className="share-button" aria-label="Share bet">
            <Share2 size={20} />
          </button>
        </div>
      </div>

      <div className="bet-info">
        <div className="bet-meta">
          <span className="bet-creator">Created by {bet.creator_name}</span>
          <span className="bet-type">{BET_TYPE_NAMES[bet.bettype]}</span>
          <span className="bet-date">{formatDate(bet.created_at)}</span>
        </div>

        {bet.description && (
          <div className="bet-description">
            <h2>Description</h2>
            <p>{bet.description}</p>
          </div>
        )}
      </div>

      <div className="predictions-section">
        <h2>Predictions ({participants.length})</h2>
        <PredictionForm bet={bet} onSuccess={() => {
          fetchBetParticipants(bet.id).then(result => {
            if (!result.error) {
              setParticipants(result.data || []);
            }
          });
        }} />
        
        {participants.length > 0 ? (
          <div className="predictions-list">
            {participants.map((participant) => (
              <div key={participant.id} className="prediction-card">
                <span className="participant-name">{participant.name}</span>
                <span className="prediction-value">{participant.prediction}</span>
                <span className="prediction-date">
                  {formatDate(participant.created_at)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-predictions">No predictions yet. Be the first!</p>
        )}
      </div>
    </div>
  );
};