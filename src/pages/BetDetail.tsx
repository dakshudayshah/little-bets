import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { fetchBetByCodeName, fetchParticipants } from '../lib/supabase';
import type { Bet, BetParticipant } from '../types';
import BetStats from '../components/BetStats';
import PredictionForm from '../components/PredictionForm';
import '../styles/BetDetail.css';

function BetDetail() {
  const { id } = useParams<{ id: string }>();
  const [bet, setBet] = useState<Bet | null>(null);
  const [participants, setParticipants] = useState<BetParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBet = useCallback(async () => {
    if (!id) return;
    try {
      const betData = await fetchBetByCodeName(id);
      if (!betData) {
        setError('Bet not found');
        return;
      }
      setBet(betData);
      const parts = await fetchParticipants(betData.id);
      setParticipants(parts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bet');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadBet();

    // Poll for updates every 5 seconds so other browsers see new predictions
    const interval = setInterval(loadBet, 5000);
    return () => clearInterval(interval);
  }, [loadBet]);

  function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: bet?.question, url }).catch(() => {
        // User cancelled or share failed — fall back to clipboard
        navigator.clipboard.writeText(url);
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  }

  async function handlePredictionSubmitted() {
    // Manually refetch instead of using real-time (Safari issues)
    if (!id) return;
    const betData = await fetchBetByCodeName(id);
    if (betData) {
      setBet(betData);
      const parts = await fetchParticipants(betData.id);
      setParticipants(parts);
    }
  }

  if (loading) return <div className="page"><p>Loading...</p></div>;
  if (error || !bet) return <div className="page"><p className="error-text">{error || 'Bet not found'}</p></div>;

  return (
    <div className="page">
      <div className="bet-detail-header">
        <div className="bet-detail-type">
          {bet.bet_type === 'yesno' ? 'Yes / No' : 'Multiple Choice'}
        </div>
        <h1 className="bet-detail-question">{bet.question}</h1>
        {bet.description && (
          <p className="bet-detail-description">{bet.description}</p>
        )}
        <div className="bet-detail-meta">
          {bet.creator_name && <span>Created by {bet.creator_name}</span>}
          <span>{bet.total_predictions} prediction{bet.total_predictions !== 1 ? 's' : ''}</span>
          <span>{new Date(bet.created_at).toLocaleDateString()}</span>
        </div>
        <button className="share-btn" onClick={handleShare}>
          Share
        </button>
      </div>

      <BetStats bet={bet} />
      <PredictionForm bet={bet} onPredictionSubmitted={handlePredictionSubmitted} />

      {participants.length > 0 && (
        <div className="participants-section">
          <h3>Recent Predictions</h3>
          <ul className="participants-list">
            {participants.map(p => (
              <li key={p.id} className="participant-item">
                <span className="participant-name">{p.participant_name}</span>
                <span className={`participant-prediction ${p.prediction ? 'yes' : 'no'}`}>
                  {bet.bet_type === 'yesno'
                    ? (p.prediction ? 'Yes' : 'No')
                    : bet.options[p.option_index]?.text ?? 'Unknown'
                  }
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default BetDetail;
