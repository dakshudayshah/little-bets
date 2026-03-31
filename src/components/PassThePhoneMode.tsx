import { useState, useEffect, useCallback } from 'react';
import { submitPrediction } from '../lib/supabase';
import { track } from '../lib/analytics';
import type { Bet } from '../types';
import '../styles/PassThePhone.css';

type Step = 'intro' | 'name' | 'pick' | 'locked' | 'handoff';

interface Props {
  bet: Bet;
  onExit: () => void;
  predictionCount: number;
}

function PassThePhoneMode({ bet, onExit, predictionCount }: Props) {
  const [step, setStep] = useState<Step>('intro');
  const [name, setName] = useState('');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [selectedPrediction, setSelectedPrediction] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [tapLocked, setTapLocked] = useState(false);
  const [localCount, setLocalCount] = useState(predictionCount);
  const [confirmLabel, setConfirmLabel] = useState('');

  // Sync external count
  useEffect(() => {
    setLocalCount(predictionCount);
  }, [predictionCount]);

  // Request fullscreen (progressive enhancement)
  useEffect(() => {
    const el = document.documentElement;
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    }
    track('ptp_started', { bet_id: bet.id });
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, [bet.id]);

  const reset = useCallback(() => {
    setName('');
    setSelectedOption(null);
    setSelectedPrediction(null);
    setError(null);
    setConfirmLabel('');
  }, []);

  function handleSelectOption(optionIndex: number, prediction: boolean) {
    setSelectedOption(optionIndex);
    setSelectedPrediction(prediction);
    setError(null);
  }

  async function handleLockIn() {
    if (selectedOption === null || selectedPrediction === null) return;
    if (!name.trim()) {
      setError('Enter your name first');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await submitPrediction({
        bet_id: bet.id,
        participant_name: name.trim(),
        prediction: selectedPrediction,
        option_index: selectedOption,
      });

      const label = bet.bet_type === 'yesno'
        ? (selectedPrediction ? 'Yes' : 'No')
        : bet.options[selectedOption]?.text ?? '';

      setConfirmLabel(label);
      setLocalCount(c => c + 1);

      // Haptic
      if (navigator.vibrate) navigator.vibrate(100);

      track('ptp_prediction', { bet_id: bet.id, bet_type: bet.bet_type });

      setStep('locked');

      // Auto-advance to handoff after 1s
      setTimeout(() => {
        setStep('handoff');
        setTapLocked(true);
        // Unlock taps after 1.5s
        setTimeout(() => setTapLocked(false), 1500);
      }, 1000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit';
      if (message.includes('duplicate') || message.includes('unique')) {
        setError('This name already predicted on this bet');
      } else {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleReady() {
    if (tapLocked) return;
    reset();
    setStep('name');
  }

  function handleDone() {
    track('ptp_done', { bet_id: bet.id, predictions_collected: localCount });
    onExit();
  }

  const reducedMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div className="ptp-overlay">
      <div className="ptp-container">
        {/* Done button - always visible except during locked confirmation */}
        {step !== 'locked' && (
          <div className="ptp-top-bar">
            <button className="ptp-done-btn" onClick={handleDone}>
              Done? Show Results
            </button>
            <span className="ptp-counter">{localCount} prediction{localCount !== 1 ? 's' : ''}</span>
          </div>
        )}

        {/* STEP: Intro */}
        {step === 'intro' && (
          <div className="ptp-step ptp-intro">
            <p className="ptp-subtitle">Pass the phone around</p>
            <h1 className="ptp-question">{bet.question}</h1>
            {bet.description && (
              <p className="ptp-description">{bet.description}</p>
            )}
            <button className="ptp-cta" onClick={() => setStep('name')}>
              Start
            </button>
          </div>
        )}

        {/* STEP: Name */}
        {step === 'name' && (
          <div className="ptp-step ptp-name-step">
            <h1 className="ptp-question">{bet.question}</h1>
            <p className="ptp-subtitle">What's your name?</p>
            <input
              className="ptp-name-input"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={50}
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter' && name.trim()) setStep('pick');
              }}
            />
            {error && <p className="ptp-error">{error}</p>}
            <button
              className="ptp-cta"
              onClick={() => {
                if (!name.trim()) {
                  setError('Enter your name');
                  return;
                }
                setError(null);
                setStep('pick');
              }}
            >
              Next
            </button>
          </div>
        )}

        {/* STEP: Pick option */}
        {step === 'pick' && (
          <div className="ptp-step ptp-pick-step">
            <h1 className="ptp-question">{bet.question}</h1>
            <p className="ptp-subtitle">{name}, make your call</p>

            {bet.bet_type === 'yesno' ? (
              <div className="ptp-options">
                <button
                  className={`ptp-option ${selectedOption === 0 && selectedPrediction === true ? 'selected' : ''}`}
                  onClick={() => handleSelectOption(0, true)}
                >
                  Yes
                </button>
                <button
                  className={`ptp-option ${selectedOption === 0 && selectedPrediction === false ? 'selected' : ''}`}
                  onClick={() => handleSelectOption(0, false)}
                >
                  No
                </button>
              </div>
            ) : (
              <div className="ptp-options">
                {bet.options.map((option, index) => (
                  <button
                    key={index}
                    className={`ptp-option ${selectedOption === index ? 'selected' : ''}`}
                    onClick={() => handleSelectOption(index, true)}
                  >
                    {option.text}
                  </button>
                ))}
              </div>
            )}

            {error && <p className="ptp-error">{error}</p>}

            {selectedOption !== null && (
              <button
                className="ptp-lock-btn"
                onClick={handleLockIn}
                disabled={submitting}
              >
                {submitting ? 'LOCKING...' : 'LOCK IT IN'}
              </button>
            )}
          </div>
        )}

        {/* STEP: Locked confirmation */}
        {step === 'locked' && (
          <div className={`ptp-step ptp-locked-step ${reducedMotion ? '' : 'ptp-flash'}`}>
            <p className="ptp-locked-name">{name}</p>
            <h1 className="ptp-locked-label">{confirmLabel}</h1>
            <p className="ptp-locked-text">Locked in!</p>
          </div>
        )}

        {/* STEP: Handoff */}
        {step === 'handoff' && (
          <div className="ptp-step ptp-handoff-step">
            <p className="ptp-handoff-text">Pass the phone to the next person</p>
            <button
              className={`ptp-cta ptp-ready-btn ${tapLocked ? 'tap-locked' : ''}`}
              onClick={handleReady}
              disabled={tapLocked}
            >
              {tapLocked ? '...' : "I'M READY"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PassThePhoneMode;
