import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBet } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { track } from '../lib/analytics';
import { saveCreatorToken, setHashToken, isStorageAvailable } from '../lib/creator-token';
import { OCCASION_PROMPTS, type OccasionPrompt } from '../lib/example-bets';
import '../styles/Home.css';

const MAX_OPTIONS = 6;

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [creating, setCreating] = useState<string | null>(null);
  const [heroQuestion, setHeroQuestion] = useState('');
  const [heroType, setHeroType] = useState<'yesno' | 'multiple_choice'>('yesno');
  const [heroOptions, setHeroOptions] = useState(['', '']);
  const [resolveBy, setResolveBy] = useState('');
  const [reminderEmail, setReminderEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [showEditOverlay, setShowEditOverlay] = useState(false);
  const [editPrompt, setEditPrompt] = useState<OccasionPrompt | null>(null);
  const [editOptions, setEditOptions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Little Bets';
    track('page_viewed', { page: 'home' });
  }, []);

  function validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async function handleCreate(prompt: OccasionPrompt) {
    if (creating) return;
    setCreating(prompt.label);
    setError(null);

    try {
      const betOptions = prompt.bet_type === 'yesno'
        ? [
            { text: 'Yes', yes_count: 0, no_count: 0 },
            { text: 'No', yes_count: 0, no_count: 0 },
          ]
        : (prompt.options || []).map(text => ({ text, yes_count: 0, no_count: 0 }));

      const token = user ? undefined : crypto.randomUUID();
      const name = user
        ? (user.user_metadata?.full_name ?? user.email ?? null)
        : null;

      const bet = await createBet({
        question: prompt.question,
        description: null,
        bet_type: prompt.bet_type,
        options: betOptions,
        creator_id: user?.id ?? null,
        creator_name: name,
        creator_token: token,
        resolve_by: resolveBy || null,
        reminder_email: resolveBy && reminderEmail ? reminderEmail : null,
      });

      if (token) {
        saveCreatorToken(bet.id, token);
        if (!isStorageAvailable()) {
          track('creator_token_lost', { reason: 'storage_unavailable' });
        }
      }

      track('bet_created', {
        source: 'gallery',
        occasion: prompt.label,
        bet_type: prompt.bet_type,
        bet_id: bet.id,
        anonymous: !user,
      });

      if (token) {
        navigate(`/bet/${bet.code_name}/ptp/start`);
        setTimeout(() => setHashToken(token), 0);
      } else {
        navigate(`/bet/${bet.code_name}/ptp/start`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create');
      setCreating(null);
    }
  }

  async function handleHeroCreate(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = heroQuestion.trim();
    if (!trimmed) return;

    if (heroType === 'multiple_choice') {
      const valid = heroOptions.filter(o => o.trim());
      if (valid.length < 2) {
        setError('At least 2 options required');
        return;
      }
    }

    if (reminderEmail && !validateEmail(reminderEmail)) {
      setEmailError('Enter a valid email');
      return;
    }

    await handleCreate({
      emoji: '✨',
      label: 'Custom',
      question: trimmed,
      bet_type: heroType,
      options: heroType === 'multiple_choice'
        ? heroOptions.filter(o => o.trim())
        : undefined,
    });
  }

  function handleGalleryTap(prompt: OccasionPrompt) {
    if (prompt.bet_type === 'multiple_choice' && prompt.options) {
      setEditPrompt(prompt);
      setEditOptions([...prompt.options]);
      setShowEditOverlay(true);
    } else {
      handleCreate(prompt);
    }
  }

  async function handleEditConfirm() {
    if (!editPrompt) return;
    const valid = editOptions.filter(o => o.trim());
    if (valid.length < 2) {
      setError('At least 2 options required');
      return;
    }
    await handleCreate({
      ...editPrompt,
      options: valid,
    });
    setShowEditOverlay(false);
  }

  return (
    <div className="page">
      {/* Hero create section */}
      <form className="hero-create" onSubmit={handleHeroCreate}>
        <label className="hero-label" htmlFor="hero-question">What do you want to bet on?</label>
        <input
          id="hero-question"
          className="hero-input"
          type="text"
          placeholder="Will the pizza arrive on time?"
          value={heroQuestion}
          onChange={e => setHeroQuestion(e.target.value)}
          maxLength={200}
          aria-describedby="hero-type-toggle"
        />

        <div className="custom-type-row" id="hero-type-toggle">
          <button
            type="button"
            className={`quick-type-btn ${heroType === 'yesno' ? 'active' : ''}`}
            onClick={() => setHeroType('yesno')}
          >
            Yes / No
          </button>
          <button
            type="button"
            className={`quick-type-btn ${heroType === 'multiple_choice' ? 'active' : ''}`}
            onClick={() => setHeroType('multiple_choice')}
          >
            Multiple Choice
          </button>
        </div>

        {heroType === 'multiple_choice' && (
          <div className="custom-options">
            {heroOptions.map((opt, i) => (
              <div key={i} className="edit-option-row">
                <input
                  className="custom-option-input"
                  type="text"
                  placeholder={`Option ${i + 1}`}
                  value={opt}
                  onChange={e => {
                    const next = [...heroOptions];
                    next[i] = e.target.value;
                    setHeroOptions(next);
                  }}
                  onFocus={e => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                />
                {heroOptions.length > 2 && (
                  <button
                    type="button"
                    className="edit-option-remove"
                    aria-label={`Remove option ${opt || i + 1}`}
                    onClick={() => setHeroOptions(heroOptions.filter((_, j) => j !== i))}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            {heroOptions.length < MAX_OPTIONS ? (
              <button
                type="button"
                className="custom-add-option"
                aria-label="Add option"
                onClick={() => setHeroOptions([...heroOptions, ''])}
              >
                + Add Option
              </button>
            ) : (
              <p className="options-max-text">Maximum 6 options</p>
            )}
          </div>
        )}

        {/* Date picker for delayed resolution */}
        <div className="hero-date-section">
          <label className="hero-date-label" htmlFor="hero-resolve-by">When will you know the answer?</label>
          <input
            id="hero-resolve-by"
            className="hero-date-input"
            type="date"
            value={resolveBy}
            onChange={e => setResolveBy(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        {resolveBy && (
          <div className="hero-email-section" aria-live="polite">
            <label className="hero-date-label" htmlFor="hero-email">Where should we send the reminder?</label>
            <input
              id="hero-email"
              className="hero-email-input"
              type="email"
              placeholder="your@email.com"
              value={reminderEmail}
              onChange={e => { setReminderEmail(e.target.value); setEmailError(null); }}
              onBlur={() => {
                if (reminderEmail && !validateEmail(reminderEmail)) {
                  setEmailError('Enter a valid email');
                } else {
                  setEmailError(null);
                }
              }}
            />
            {emailError && <p className="hero-email-error">{emailError}</p>}
          </div>
        )}

        {error && <p className="error-text">{error}</p>}

        <button type="submit" className="btn-primary-cta hero-cta" disabled={!heroQuestion.trim() || creating !== null}>
          {creating ? 'Creating...' : 'Create'}
        </button>
      </form>

      {/* Gallery divider */}
      <p className="gallery-divider">Need inspiration?</p>

      <div className="gallery-grid">
        {OCCASION_PROMPTS.map((prompt) => (
          <button
            key={prompt.label}
            className="gallery-card"
            onClick={() => handleGalleryTap(prompt)}
            disabled={creating !== null}
            tabIndex={0}
            aria-label={`Create a ${prompt.label} bet: ${prompt.question}`}
          >
            {prompt.sampleImage && (
              <img
                src={prompt.sampleImage}
                alt=""
                className="gallery-card-thumb"
                loading="lazy"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
            <div className="gallery-card-content">
              <span className="gallery-card-emoji">{prompt.emoji}</span>
              <span className="gallery-card-label">{prompt.label}</span>
              <span className="gallery-card-prompt">{prompt.question}</span>
            </div>
            {creating === prompt.label && (
              <div className="gallery-card-loading">Creating...</div>
            )}
          </button>
        ))}
      </div>

      {/* Editable options overlay */}
      {showEditOverlay && editPrompt && (
        <div
          className="edit-overlay"
          role="dialog"
          aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) setShowEditOverlay(false); }}
        >
          <div className="edit-overlay-content">
            <h3 className="edit-overlay-title">{editPrompt.question}</h3>
            <div className="custom-options">
              {editOptions.map((opt, i) => (
                <div key={i} className="edit-option-row">
                  <input
                    className="custom-option-input"
                    type="text"
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onChange={e => {
                      const next = [...editOptions];
                      next[i] = e.target.value;
                      setEditOptions(next);
                    }}
                    onFocus={e => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                  />
                  {editOptions.length > 2 && (
                    <button
                      type="button"
                      className="edit-option-remove"
                      aria-label={`Remove option ${opt || i + 1}`}
                      onClick={() => setEditOptions(editOptions.filter((_, j) => j !== i))}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              {editOptions.length < MAX_OPTIONS ? (
                <button
                  type="button"
                  className="custom-add-option"
                  aria-label="Add option"
                  onClick={() => setEditOptions([...editOptions, ''])}
                >
                  + Add Option
                </button>
              ) : (
                <p className="options-max-text">Maximum 6 options</p>
              )}
            </div>
            <div className="custom-actions">
              <button className="btn-primary-cta" onClick={handleEditConfirm} disabled={creating !== null}>
                {creating ? 'Creating...' : 'Start'}
              </button>
              <button className="custom-cancel" onClick={() => setShowEditOverlay(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
