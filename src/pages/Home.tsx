import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBet } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { track } from '../lib/analytics';
import { saveCreatorToken, setHashToken, isStorageAvailable } from '../lib/creator-token';
import { OCCASION_PROMPTS, type OccasionPrompt } from '../lib/example-bets';
import '../styles/Home.css';

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [creating, setCreating] = useState<string | null>(null);
  const [showCustom, setShowCustom] = useState(false);
  const [customQuestion, setCustomQuestion] = useState('');
  const [customType, setCustomType] = useState<'yesno' | 'multiple_choice'>('yesno');
  const [customOptions, setCustomOptions] = useState(['', '']);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Little Bets';
    track('page_viewed', { page: 'home' });
  }, []);

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

  async function handleCustomCreate(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = customQuestion.trim();
    if (!trimmed) return;

    if (customType === 'multiple_choice') {
      const valid = customOptions.filter(o => o.trim());
      if (valid.length < 2) {
        setError('At least 2 options required');
        return;
      }
    }

    await handleCreate({
      emoji: '✨',
      label: 'Custom',
      question: trimmed,
      bet_type: customType,
      options: customType === 'multiple_choice'
        ? customOptions.filter(o => o.trim())
        : undefined,
    });
  }

  return (
    <div className="page">
      <p className="home-subtitle">Pick an occasion. Pass the phone. Make a moment.</p>

      {error && <p className="error-text">{error}</p>}

      <div className="gallery-grid">
        {OCCASION_PROMPTS.map((prompt) => (
          <button
            key={prompt.label}
            className="gallery-card"
            onClick={() => handleCreate(prompt)}
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

        {/* Create your own */}
        <button
          className="gallery-card gallery-card-custom"
          onClick={() => setShowCustom(true)}
          tabIndex={0}
          aria-label="Create your own bet"
        >
          <div className="gallery-card-content">
            <span className="gallery-card-emoji">✨</span>
            <span className="gallery-card-label">Create your own</span>
            <span className="gallery-card-prompt">Any question, any occasion</span>
          </div>
        </button>
      </div>

      {/* Custom creation form */}
      {showCustom && (
        <div className="custom-create-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) setShowCustom(false);
        }}>
          <form className="custom-create-form" onSubmit={handleCustomCreate}>
            <h3 className="custom-create-title">Create your own</h3>
            <input
              className="custom-create-input"
              type="text"
              placeholder="What's the question?"
              value={customQuestion}
              onChange={e => setCustomQuestion(e.target.value)}
              maxLength={200}
              autoFocus
            />

            <div className="custom-type-row">
              <button
                type="button"
                className={`quick-type-btn ${customType === 'yesno' ? 'active' : ''}`}
                onClick={() => setCustomType('yesno')}
              >
                Yes / No
              </button>
              <button
                type="button"
                className={`quick-type-btn ${customType === 'multiple_choice' ? 'active' : ''}`}
                onClick={() => setCustomType('multiple_choice')}
              >
                Multiple Choice
              </button>
            </div>

            {customType === 'multiple_choice' && (
              <div className="custom-options">
                {customOptions.map((opt, i) => (
                  <input
                    key={i}
                    className="custom-option-input"
                    type="text"
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onChange={e => {
                      const next = [...customOptions];
                      next[i] = e.target.value;
                      setCustomOptions(next);
                    }}
                  />
                ))}
                {customOptions.length < 4 && (
                  <button
                    type="button"
                    className="custom-add-option"
                    onClick={() => setCustomOptions([...customOptions, ''])}
                  >
                    + Add Option
                  </button>
                )}
              </div>
            )}

            <div className="custom-actions">
              <button type="submit" className="btn-primary-cta" disabled={!customQuestion.trim() || creating !== null}>
                {creating ? 'Creating...' : 'Start'}
              </button>
              <button type="button" className="custom-cancel" onClick={() => setShowCustom(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Home;
