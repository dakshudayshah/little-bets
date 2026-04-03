import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBet } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { track } from '../lib/analytics';
import { saveCreatorToken, setHashToken, isStorageAvailable } from '../lib/creator-token';
import type { BetType } from '../types';
import { ALL_EXAMPLES } from '../lib/example-bets';
import '../styles/Home.css';

const PLACEHOLDERS = [
  'Will Dave actually run that marathon?',
  'Is pineapple on pizza acceptable?',
  'Will it snow before March?',
  'Can Sarah finish the book club book this month?',
  'Will the meeting end on time today?',
  'Will Jake text back within an hour?',
  'Is the new restaurant going to be worth the hype?',
  'Will someone fall asleep during the presentation?',
  'Can anyone beat Mike at ping pong this week?',
  'Will the group chat stay active for 30 days straight?',
  'Is the project going to ship on time?',
  'Will Mom ask about marriage at dinner?',
  'Can Lisa go a whole day without coffee?',
  'Will the WiFi crash during the big demo?',
  'Is anyone actually going to show up on time?',
  'Will the potluck have more desserts than mains?',
  'Can the team agree on a restaurant in under 5 minutes?',
  'Will it be a shorts or jacket kind of weekend?',
  'Is the sequel going to be better than the original?',
  'Will someone suggest karaoke tonight?',
];

function sampleN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

// Compute at module load — examples must not reshuffle when the user types
const FEATURED = sampleN(ALL_EXAMPLES, 4);

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [betType, setBetType] = useState<BetType>('yesno');
  const [options, setOptions] = useState(['', '']);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placeholder] = useState(
    () => PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)]
  );

  useEffect(() => {
    document.title = 'Little Bets';
    track('page_viewed', { page: 'home' });
  }, []);

  function updateOption(index: number, value: string) {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  }

  function addOption() {
    if (options.length < 4) {
      setOptions([...options, '']);
    }
  }

  function removeOption(index: number) {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  }

  function handleExampleClick(exampleQuestion: string) {
    setQuestion(exampleQuestion);
  }

  async function handleQuickCreate(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed) return;

    if (betType === 'multiple_choice') {
      const validOptions = options.map(o => o.trim()).filter(o => o.length > 0);
      if (validOptions.length < 2) {
        setError('At least 2 options are required');
        return;
      }
    }

    setCreating(true);
    setError(null);
    try {
      const betOptions = betType === 'yesno'
        ? [
            { text: 'Yes', yes_count: 0, no_count: 0 },
            { text: 'No', yes_count: 0, no_count: 0 },
          ]
        : options
            .map(o => o.trim())
            .filter(o => o.length > 0)
            .map(text => ({ text, yes_count: 0, no_count: 0 }));

      const token = user ? undefined : crypto.randomUUID();
      const name = user
        ? (user.user_metadata?.full_name ?? user.email ?? null)
        : null;

      const bet = await createBet({
        question: trimmed,
        description: null,
        bet_type: betType,
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

      track('bet_created', { source: 'quick', bet_type: betType, visibility: 'open', bet_id: bet.id, anonymous: !user });

      if (token) {
        navigate(`/bet/${bet.code_name}?ptp=1`);
        setTimeout(() => setHashToken(token), 0);
      } else {
        navigate(`/bet/${bet.code_name}?ptp=1`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create bet');
      setCreating(false);
    }
  }

  return (
    <div className="page">
      <p className="home-subtitle">Capture a group moment. No sign-up needed.</p>

      <form className="quick-create" onSubmit={handleQuickCreate}>
        <div className="quick-create-top">
          <input
            className="quick-create-input"
            type="text"
            placeholder={placeholder}
            value={question}
            onChange={e => setQuestion(e.target.value)}
            disabled={creating}
            maxLength={200}
          />
          <button
            type="submit"
            className="quick-create-btn btn-primary-cta"
            disabled={creating || !question.trim()}
          >
            {creating ? '...' : 'Bet!'}
          </button>
        </div>

        <div className="quick-create-type-row">
          <button
            type="button"
            className={`quick-type-btn ${betType === 'yesno' ? 'active' : ''}`}
            onClick={() => setBetType('yesno')}
          >
            Yes / No
          </button>
          <button
            type="button"
            className={`quick-type-btn ${betType === 'multiple_choice' ? 'active' : ''}`}
            onClick={() => setBetType('multiple_choice')}
          >
            Multiple Choice
          </button>
        </div>

        {betType === 'multiple_choice' && (
          <div className="quick-create-options">
            {options.map((option, index) => (
              <div key={index} className="quick-option-row">
                <input
                  className="quick-option-input"
                  type="text"
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={e => updateOption(index, e.target.value)}
                  disabled={creating}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    className="quick-option-remove"
                    onClick={() => removeOption(index)}
                  >
                    X
                  </button>
                )}
              </div>
            ))}
            {options.length < 4 && (
              <button type="button" className="quick-add-option" onClick={addOption}>
                + Add Option
              </button>
            )}
          </div>
        )}
      </form>

      {question.length > 0 && (
        <div className="quick-create-meta">
          <span className={`char-count ${question.length >= 180 ? 'warn' : ''}`}>
            {question.length}/200
          </span>
        </div>
      )}

      {error && <p className="error-text">{error}</p>}

      <div className="example-bets">
        <p className="example-bets-label">Need inspiration?</p>
        <div className="example-bets-grid">
          {FEATURED.map((example, i) => (
            <button
              key={i}
              className="example-bet-card"
              onClick={() => handleExampleClick(example.question)}
              type="button"
            >
              {example.question}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
