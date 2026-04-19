import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitPrediction, uploadPhoto } from '../lib/supabase';
import { track } from '../lib/analytics';
import { resizeImage } from '../lib/image-utils';
import { usePTP } from '../context/PTPContext';
import MomentCard from './MomentCard';
import '../styles/PassThePhone.css';

const ANSWER_FIRST = true;

type Step = 'pick' | 'name' | 'locked' | 'primer' | 'photo' | 'handoff' | 'card1';

function PassThePhoneMode() {
  const { bet, participants, setPhotos, photos, predictionCount, setPredictionCount, codeName } = usePTP();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(ANSWER_FIRST ? 'pick' : 'name');
  const [name, setName] = useState('');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [selectedPrediction, setSelectedPrediction] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [tapLocked, setTapLocked] = useState(false);
  const [localCount, setLocalCount] = useState(predictionCount);
  const [confirmLabel, setConfirmLabel] = useState('');
  const [card1Visible, setCard1Visible] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lockTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const photoTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setLocalCount(predictionCount);
  }, [predictionCount]);

  useEffect(() => {
    const el = document.documentElement;
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    }
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      clearTimeout(photoTimerRef.current);
      clearTimeout(lockTimerRef.current);
    };
  }, []);

  const reset = useCallback(() => {
    setName('');
    setSelectedOption(null);
    setSelectedPrediction(null);
    setError(null);
    setConfirmLabel('');
  }, []);

  if (!bet) return null;

  function handleSelectOption(optionIndex: number, prediction: boolean) {
    setSelectedOption(optionIndex);
    setSelectedPrediction(prediction);
    setError(null);
  }

  function handleNextFromPick() {
    if (selectedOption === null) {
      setError('Pick an answer first');
      return;
    }
    setError(null);
    setStep('name');
  }

  function handleNextFromName() {
    if (!name.trim()) {
      setError('Enter your name');
      return;
    }
    setError(null);
    if (ANSWER_FIRST) {
      handleLockIn();
    } else {
      setStep('pick');
    }
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
        bet_id: bet!.id,
        participant_name: name.trim(),
        prediction: selectedPrediction,
        option_index: selectedOption,
      });

      const label = bet!.bet_type === 'yesno'
        ? (selectedPrediction ? 'Yes' : 'No')
        : bet!.options[selectedOption]?.text ?? '';

      setConfirmLabel(label);
      setLocalCount(c => c + 1);
      setPredictionCount(c => c + 1);

      if (navigator.vibrate) navigator.vibrate(100);

      track('ptp_prediction_locked', { bet_id: bet!.id, bet_type: bet!.bet_type });

      setStep('locked');
      photoTimerRef.current = setTimeout(() => setStep('primer'), 700);
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

  function goToHandoff() {
    setStep('handoff');
    setTapLocked(true);
    lockTimerRef.current = setTimeout(() => setTapLocked(false), 1500);
  }

  async function handlePhotoCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await resizeImage(file, 400);
      const trimmedName = name.trim();

      setPhotos(prev => {
        const next = new Map(prev);
        next.set(trimmedName, dataUrl);
        return next;
      });

      track('ptp_photo_taken', { bet_id: bet!.id });

      const cacheKey = `ptp_photos_${bet!.id}`;
      const cached = JSON.parse(sessionStorage.getItem(cacheKey) || '{}');
      cached[trimmedName] = dataUrl;
      sessionStorage.setItem(cacheKey, JSON.stringify(cached));

      uploadPhoto(bet!.id, trimmedName, dataUrl).then((ok) => {
        if (ok) {
          track('ptp_photo_uploaded', { bet_id: bet!.id });
        } else {
          track('ptp_photo_upload_failed', { bet_id: bet!.id });
        }
      });
    } catch { /* photo failed */ }
    goToHandoff();
  }

  function handleReady() {
    if (tapLocked) return;
    reset();
    setStep(ANSWER_FIRST ? 'pick' : 'name');
  }

  function handleDone() {
    track('ptp_done', { bet_id: bet!.id, predictions_collected: localCount });
    setStep('card1');
    setTimeout(() => setCard1Visible(true), 50);
  }

  const reducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  return (
    <div className="ptp-overlay">
      <div className="ptp-container">
        {step !== 'locked' && (
          <div className="ptp-top-bar">
            <button className="ptp-done-btn" onClick={handleDone}>
              Done? Show Results
            </button>
            <span className="ptp-counter">{localCount} prediction{localCount !== 1 ? 's' : ''}</span>
          </div>
        )}

        {/* STEP: Pick option (first when ANSWER_FIRST) */}
        {step === 'pick' && (
          <div className="ptp-step ptp-pick-step">
            <h1 className="ptp-question">{bet.question}</h1>
            <p className="ptp-subtitle">
              {ANSWER_FIRST ? 'Make your call' : `${name}, make your call`}
            </p>

            {bet.bet_type === 'yesno' ? (
              <div className="ptp-options" role="radiogroup">
                <button
                  className={`ptp-option ${selectedOption === 0 && selectedPrediction === true ? 'selected' : ''}`}
                  onClick={() => handleSelectOption(0, true)}
                  role="radio"
                  aria-checked={selectedOption === 0 && selectedPrediction === true}
                >
                  Yes
                </button>
                <button
                  className={`ptp-option ${selectedOption === 0 && selectedPrediction === false ? 'selected' : ''}`}
                  onClick={() => handleSelectOption(0, false)}
                  role="radio"
                  aria-checked={selectedOption === 0 && selectedPrediction === false}
                >
                  No
                </button>
              </div>
            ) : (
              <div className="ptp-options" role="radiogroup">
                {bet.options.map((option, index) => (
                  <button
                    key={index}
                    className={`ptp-option ${selectedOption === index ? 'selected' : ''}`}
                    onClick={() => handleSelectOption(index, true)}
                    role="radio"
                    aria-checked={selectedOption === index}
                  >
                    {option.text}
                  </button>
                ))}
              </div>
            )}

            {error && <p className="ptp-error">{error}</p>}

            {ANSWER_FIRST && selectedOption !== null && (
              <button className="ptp-cta" onClick={handleNextFromPick}>
                Next
              </button>
            )}

            {!ANSWER_FIRST && selectedOption !== null && (
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

        {/* STEP: Name */}
        {step === 'name' && (
          <div className="ptp-step ptp-name-step">
            <h1 className="ptp-question">{bet.question}</h1>
            <label className="ptp-name-label" htmlFor="ptp-name">Who are you?</label>
            <input
              id="ptp-name"
              className="ptp-name-input"
              type="text"
              placeholder="First name"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={50}
              autoFocus
              onFocus={e => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })}
              onKeyDown={e => {
                if (e.key === 'Enter' && name.trim()) handleNextFromName();
              }}
            />
            {error && <p className="ptp-error">{error}</p>}
            <button
              className="ptp-lock-btn"
              onClick={handleNextFromName}
              disabled={submitting}
            >
              {submitting ? 'LOCKING...' : 'LOCK IT IN'}
            </button>
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

        {/* STEP: Permission Primer */}
        {step === 'primer' && (
          <div className="ptp-step ptp-primer-step">
            <div className="ptp-primer-card" aria-hidden="true">
              <div className="ptp-primer-card-inner">
                <p className="ptp-primer-brand">Little Bets</p>
                <p className="ptp-primer-question">{bet.question}</p>
                <div className="ptp-primer-faces">
                  {Array.from(photos.entries()).slice(0, 3).map(([pName, src]) => (
                    <img key={pName} src={src} alt="" className="ptp-primer-face" />
                  ))}
                  <div className="ptp-primer-face ptp-primer-you">
                    {name.charAt(0).toUpperCase() || '?'}
                  </div>
                </div>
              </div>
            </div>
            <p className="ptp-primer-copy">Your photo goes on the group's moment card. We don't store it anywhere else.</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="user"
              className="ptp-file-input"
              onChange={handlePhotoCapture}
            />
            <button
              className="ptp-cta ptp-camera-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              Add your photo to the moment card
            </button>
            <button className="ptp-skip-btn" onClick={goToHandoff}>
              Skip
            </button>
          </div>
        )}

        {/* STEP: Photo (direct, bypassed by primer) */}
        {step === 'photo' && (
          <div className="ptp-step ptp-photo-step">
            <p className="ptp-subtitle">Add your photo to the moment card</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="user"
              className="ptp-file-input"
              onChange={handlePhotoCapture}
            />
            <button
              className="ptp-cta ptp-camera-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              Take Photo
            </button>
            <button className="ptp-skip-btn" onClick={goToHandoff}>
              Skip
            </button>
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

        {/* STEP: Card 1 — The Stakes */}
        {step === 'card1' && bet && (
          <div className="ptp-step ptp-card1-step">
            <div
              className={`ptp-card1-reveal ${card1Visible ? 'visible' : ''} ${reducedMotion ? 'no-motion' : ''}`}
            >
              <MomentCard
                bet={bet}
                participants={participants}
                photos={photos}
                codeName={codeName}
                variant="stakes"
              />
            </div>
            <div className="ptp-card1-actions">
              <button
                className="ptp-card1-resolve"
                onClick={() => navigate(`/bet/${codeName}/ptp/reveal`)}
              >
                Resolve now
              </button>
              <button
                className="ptp-skip-btn"
                onClick={() => navigate(`/bet/${codeName}`)}
              >
                Resolve later
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PassThePhoneMode;
