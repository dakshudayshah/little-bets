import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { resolveBet, resolveBetAnonymous, fetchParticipants } from '../lib/supabase';
import { usePTP } from '../context/PTPContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { track } from '../lib/analytics';
import { getCreatorToken } from '../lib/creator-token';
import { getWinningLabel } from '../lib/bet-utils';
import MomentCard from '../components/MomentCard';
import Confetti from '../components/Confetti';
import type { Bet } from '../types';
import '../styles/PassThePhone.css';
import '../styles/PTPReveal.css';

type RevealPhase = 'choose' | 'resolving' | 'reveal' | 'card';

function PTPReveal() {
  const { bet, setBet, participants, setParticipants, photos, loading, error, codeName } = usePTP();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<RevealPhase>('choose');
  const [resolving, setResolving] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [resultLabel, setResultLabel] = useState('');

  // If bet is already resolved, skip to card
  useEffect(() => {
    if (bet?.resolved) {
      setResultLabel(getWinningLabel(bet) || 'Resolved');
      setPhase('card');
    }
  }, [bet?.resolved]);

  // Refresh participants when entering reveal
  useEffect(() => {
    if (bet && !bet.resolved) {
      fetchParticipants(bet.id).then(setParticipants);
    }
  }, [bet?.id]);

  if (loading) return <div className="ptp-overlay"><div className="ptp-container"><p className="ptp-subtitle">Loading...</p></div></div>;
  if (error || !bet) return <div className="ptp-overlay"><div className="ptp-container"><p className="ptp-error">{error || 'Bet not found'}</p></div></div>;

  async function handleResolve(winningOptionIndex: number) {
    if (!bet) return;
    setResolving(true);
    setPhase('resolving');

    try {
      let updated: Bet;
      const anonToken = getCreatorToken(bet.id);
      if (!user && anonToken) {
        updated = await resolveBetAnonymous(bet.id, winningOptionIndex, anonToken);
      } else {
        updated = await resolveBet(bet.id, winningOptionIndex);
      }

      track('bet_resolved', { bet_id: bet.id, prediction_count: bet.total_predictions, source: 'ptp_reveal' });
      setBet(updated);

      const label = getWinningLabel(updated) || 'Resolved';
      setResultLabel(label);

      // Reveal sequence: pause → confetti → result → card
      setTimeout(() => {
        setShowConfetti(true);
        setPhase('reveal');

        // Refresh participants to show sealed predictions
        fetchParticipants(bet.id).then(setParticipants);

        setTimeout(() => {
          setPhase('card');
        }, 1400);
      }, 500);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to resolve');
      setPhase('choose');
    } finally {
      setResolving(false);
    }
  }

  const noParticipants = participants.length === 0;

  return (
    <div className="ptp-overlay">
      {showConfetti && <Confetti onComplete={() => setShowConfetti(false)} />}

      <div className="ptp-container ptp-reveal-container">
        {/* Phase: Choose outcome */}
        {phase === 'choose' && (
          <div className="ptp-step ptp-reveal-choose">
            <p className="ptp-occasion-label">
              {bet.bet_type === 'yesno' ? 'Yes / No' : 'Multiple Choice'}
            </p>
            <h1 className="ptp-question">{bet.question}</h1>

            {noParticipants ? (
              <div className="ptp-empty-state">
                <p className="ptp-subtitle">No one locked in yet</p>
                <button className="ptp-cta" onClick={() => navigate(`/bet/${codeName}/ptp/start`)}>
                  Go back
                </button>
              </div>
            ) : (
              <>
                <p className="ptp-subtitle">
                  {participants.length} prediction{participants.length !== 1 ? 's' : ''} locked in. What's the answer?
                </p>

                {bet.bet_type === 'yesno' ? (
                  <div className="ptp-options ptp-resolve-options">
                    <button
                      className="ptp-option ptp-resolve-option"
                      onClick={() => handleResolve(0)}
                      disabled={resolving}
                    >
                      Yes
                    </button>
                    <button
                      className="ptp-option ptp-resolve-option"
                      onClick={() => handleResolve(1)}
                      disabled={resolving}
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <div className="ptp-options ptp-resolve-options">
                    {bet.options.map((option, index) => (
                      <button
                        key={index}
                        className="ptp-option ptp-resolve-option"
                        onClick={() => handleResolve(index)}
                        disabled={resolving}
                      >
                        {option.text}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Phase: Resolving (brief spinner) */}
        {phase === 'resolving' && (
          <div className="ptp-step ptp-reveal-resolving">
            <p className="ptp-subtitle">Revealing...</p>
          </div>
        )}

        {/* Phase: Result reveal */}
        {phase === 'reveal' && (
          <div className="ptp-step ptp-reveal-result" aria-live="polite">
            <p className="ptp-occasion-label">{bet.question}</p>
            <h1 className="ptp-result-text">{resultLabel}</h1>
          </div>
        )}

        {/* Phase: Moment card */}
        {phase === 'card' && (
          <div className="ptp-step ptp-reveal-card">
            <MomentCard
              bet={bet}
              participants={participants}
              photos={photos}
              codeName={codeName}
            />
            <button
              className="ptp-back-to-detail"
              onClick={() => navigate(`/bet/${codeName}`)}
            >
              View full details
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PTPReveal;
