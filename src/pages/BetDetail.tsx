import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { fetchBetByCodeName, fetchParticipants, resolveBet, updateBetVisibility, deletePrediction } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import type { Bet, BetParticipant } from '../types';
import BetStats from '../components/BetStats';
import PredictionForm from '../components/PredictionForm';
import Confetti from '../components/Confetti';
import { timeAgo } from '../lib/time';
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
  const { theme } = useTheme();
  const [bet, setBet] = useState<Bet | null>(null);
  const [participants, setParticipants] = useState<BetParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [hasPredicted, setHasPredicted] = useState(false);

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

  useEffect(() => {
    document.title = bet ? `${bet.question} - Little Bets` : 'Little Bets';
  }, [bet]);

  function getShareUrl() {
    const base = `${window.location.origin}/bet/${id}`;
    return theme !== 'retro' ? `${base}?theme=${theme}` : base;
  }

  function handleShare() {
    const url = getShareUrl();
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
    setHasPredicted(true);
    const betData = await fetchBetByCodeName(id);
    if (betData) {
      setBet(betData);
      const parts = await fetchParticipants(betData.id);
      setParticipants(parts);
    }
  }

  async function handleResolve(winningOptionIndex: number) {
    if (!bet) return;
    const label = bet.bet_type === 'yesno'
      ? (winningOptionIndex === 0 ? 'Yes' : 'No')
      : bet.options[winningOptionIndex]?.text ?? 'this option';
    if (!confirm(`Resolve this bet with "${label}" as the winner? This cannot be undone.`)) return;
    setResolving(true);
    try {
      const updated = await resolveBet(bet.id, winningOptionIndex);
      setBet(updated);

      // Fire confetti
      setShowConfetti(true);

      // Build share message with winners
      const parts = await fetchParticipants(bet.id);
      setParticipants(parts);
      const winLabel = getWinningLabel(updated);
      const winners = parts
        .filter(p => didParticipantWin(updated, p))
        .map(p => p.participant_name);
      const winnersText = winners.length > 0
        ? `${winners.join(', ')} called it!`
        : 'No one got it right!';
      const shareText = `The results are in! "${bet.question}" — ${winLabel}! ${winnersText}`;
      const betUrl = getShareUrl();

      // Delay share prompt so confetti can be enjoyed
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (navigator.share) {
        navigator.share({ title: shareText, url: betUrl }).catch(() => {
          navigator.clipboard.writeText(`${shareText} ${betUrl}`);
        });
      } else {
        navigator.clipboard.writeText(`${shareText} ${betUrl}`);
        alert('Results copied to clipboard!');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve bet');
    } finally {
      setResolving(false);
    }
  }

  async function handleRemovePrediction(predictionId: string, name: string) {
    if (!confirm(`Remove prediction by "${name}"?`)) return;
    try {
      await deletePrediction(predictionId);
      await handlePredictionSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove prediction');
    }
  }

  async function handleToggleVisibility() {
    if (!bet) return;
    const newVisibility = bet.visibility === 'open' ? 'link_only' : 'open';
    try {
      const updated = await updateBetVisibility(bet.id, newVisibility);
      setBet(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update visibility');
    }
  }

  if (loading) return <div className="page"><p>Loading...</p></div>;
  if (error || !bet) return <div className="page"><p className="error-text">{error || 'Bet not found'}</p></div>;

  const isCreator = user?.id === bet.creator_id;
  const winners = bet.resolved ? participants.filter(p => didParticipantWin(bet, p)) : [];
  const losers = bet.resolved ? participants.filter(p => !didParticipantWin(bet, p)) : [];

  return (
    <div className="page">
      {showConfetti && <Confetti onComplete={() => setShowConfetti(false)} />}

      <div className="bet-detail-header">
        <div className="bet-detail-type">
          {bet.bet_type === 'yesno' ? 'Yes / No' : 'Multiple Choice'}
          {bet.visibility === 'link_only' && <span className="link-only-badge">Link Only</span>}
          {bet.resolved && <span className="resolved-badge">Resolved</span>}
        </div>
        <h1 className="bet-detail-question">{bet.question}</h1>
        {bet.description && (
          <p className="bet-detail-description">{bet.description}</p>
        )}
        <div className="bet-detail-meta">
          {bet.creator_name && <span>Created by {bet.creator_name}</span>}
          <span key={bet.total_predictions} className="count-pop">{bet.total_predictions} prediction{bet.total_predictions !== 1 ? 's' : ''}</span>
          <span>{timeAgo(bet.created_at)}</span>
        </div>
        <div className="bet-detail-actions">
          <button className="share-btn" onClick={handleShare}>
            Share
          </button>
          {isCreator && (
            <button className="visibility-toggle-btn" onClick={handleToggleVisibility}>
              {bet.visibility === 'open' ? 'Make Link Only' : 'Make Open'}
            </button>
          )}
        </div>
      </div>

      {bet.resolved && (
        <div className="resolved-banner">
          <span className="resolved-banner-label">Result:</span>{' '}
          <strong>{getWinningLabel(bet)}</strong>
        </div>
      )}

      <BetStats bet={bet} hidden={!bet.resolved && !hasPredicted && !isCreator} />

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

      {bet.resolved && participants.length > 0 && (
        <>
          {winners.length > 0 && (
            <div className="winners-section">
              <h3 className="winners-title">Called It!</h3>
              <ul className="winners-list">
                {winners.map(p => (
                  <li key={p.id} className="winner-item">
                    <span className="winner-name">{p.participant_name}</span>
                    <span className="winner-prediction">
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
          {losers.length > 0 && (
            <div className="losers-section">
              <h3 className="losers-title">Better Luck Next Time</h3>
              <ul className="participants-list">
                {losers.map(p => (
                  <li key={p.id} className="participant-item lost">
                    <span className="participant-name">{p.participant_name}</span>
                    <span className="participant-right">
                      <span className={`participant-prediction ${p.prediction ? 'yes' : 'no'}`}>
                        {bet.bet_type === 'yesno'
                          ? (p.prediction ? 'Yes' : 'No')
                          : bet.options[p.option_index]?.text ?? 'Unknown'
                        }
                      </span>
                      {isCreator && (
                        <button
                          className="remove-prediction-btn"
                          onClick={() => handleRemovePrediction(p.id, p.participant_name)}
                          title="Remove prediction"
                        >
                          X
                        </button>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {!bet.resolved && participants.length > 0 && (
        <div className={`participants-section ${!hasPredicted && !isCreator ? 'section-hidden' : ''}`}>
          <h3>Recent Predictions</h3>
          <ul className="participants-list">
            {participants.map(p => (
              <li key={p.id} className="participant-item">
                <span className="participant-name">{p.participant_name}</span>
                <span className="participant-right">
                  <span className={`participant-prediction ${p.prediction ? 'yes' : 'no'}`}>
                    {bet.bet_type === 'yesno'
                      ? (p.prediction ? 'Yes' : 'No')
                      : bet.options[p.option_index]?.text ?? 'Unknown'
                    }
                  </span>
                  {isCreator && (
                    <button
                      className="remove-prediction-btn"
                      onClick={() => handleRemovePrediction(p.id, p.participant_name)}
                      title="Remove prediction"
                    >
                      X
                    </button>
                  )}
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
