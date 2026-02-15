import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { fetchBetByCodeName, fetchParticipants, resolveBet } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Bet, BetParticipant } from '../types';
import BetStats from '../components/BetStats';
import PredictionForm from '../components/PredictionForm';
import '../styles/BetDetail.css';

function getWinningLabel(bet: Bet): string {
  if (bet.winning_option_index === null) return '';
  if (bet.bet_type === 'yesno') {
    return bet.winning_option_index === 0 ? 'Yes' : 'No';
  }
  return bet.options[bet.winning_option_index]?.text ?? 'Unknown';
}

function didParticipantWin(bet: Bet, p: BetParticipant): boolean {
  if (bet.winning_option_index === null) return false;
  if (bet.bet_type === 'yesno') {
    return bet.winning_option_index === 0 ? p.prediction : !p.prediction;
  }
  return p.option_index === bet.winning_option_index;
}

function BetDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [bet, setBet] = useState<Bet | null>(null);
  const [participants, setParticipants] = useState<BetParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);

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
    const interval = setInterval(loadBet, 5000);
    return () => clearInterval(interval);
  }, [loadBet]);

  function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: bet?.question, url }).catch(() => {
        navigator.clipboard.writeText(url);
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  }

  async function handlePredictionSubmitted() {
    if (!id) return;
    const betData = await fetchBetByCodeName(id);
    if (betData) {
      setBet(betData);
      const parts = await fetchParticipants(betData.id);
      setParticipants(parts);
    }
  }

  async function handleResolve(winningOptionIndex: number) {
    if (!bet) return;
    setResolving(true);
    try {
      const updated = await resolveBet(bet.id, winningOptionIndex);
      setBet(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve bet');
    } finally {
      setResolving(false);
    }
  }

  if (loading) return <div className="page"><p>Loading...</p></div>;
  if (error || !bet) return <div className="page"><p className="error-text">{error || 'Bet not found'}</p></div>;

  const isCreator = user?.id === bet.creator_id;

  return (
    <div className="page">
      <div className="bet-detail-header">
        <div className="bet-detail-type">
          {bet.bet_type === 'yesno' ? 'Yes / No' : 'Multiple Choice'}
          {bet.resolved && <span className="resolved-badge">Resolved</span>}
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

      {bet.resolved && (
        <div className="resolved-banner">
          <span className="resolved-banner-label">Result:</span>{' '}
          <strong>{getWinningLabel(bet)}</strong>
        </div>
      )}

      <BetStats bet={bet} />

      {!bet.resolved && isCreator && participants.length > 0 && (
        <div className="resolve-section">
          <h3>Resolve This Bet</h3>
          <p className="resolve-hint">Select the winning outcome:</p>
          {bet.bet_type === 'yesno' ? (
            <div className="resolve-buttons">
              <button className="resolve-btn yes" onClick={() => handleResolve(0)} disabled={resolving}>
                Yes wins
              </button>
              <button className="resolve-btn no" onClick={() => handleResolve(1)} disabled={resolving}>
                No wins
              </button>
            </div>
          ) : (
            <div className="resolve-options">
              {bet.options.map((option, index) => (
                <button
                  key={index}
                  className="resolve-option-btn"
                  onClick={() => handleResolve(index)}
                  disabled={resolving}
                >
                  {option.text} wins
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {!bet.resolved && (
        <PredictionForm bet={bet} onPredictionSubmitted={handlePredictionSubmitted} />
      )}

      {participants.length > 0 && (
        <div className="participants-section">
          <h3>{bet.resolved ? 'Results' : 'Recent Predictions'}</h3>
          <ul className="participants-list">
            {participants.map(p => {
              const won = bet.resolved && didParticipantWin(bet, p);
              const lost = bet.resolved && !didParticipantWin(bet, p);
              return (
                <li key={p.id} className={`participant-item ${won ? 'won' : ''} ${lost ? 'lost' : ''}`}>
                  <span className="participant-name">
                    {p.participant_name}
                    {won && <span className="result-tag correct">Correct</span>}
                    {lost && <span className="result-tag wrong">Wrong</span>}
                  </span>
                  <span className={`participant-prediction ${p.prediction ? 'yes' : 'no'}`}>
                    {bet.bet_type === 'yesno'
                      ? (p.prediction ? 'Yes' : 'No')
                      : bet.options[p.option_index]?.text ?? 'Unknown'
                    }
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export default BetDetail;
