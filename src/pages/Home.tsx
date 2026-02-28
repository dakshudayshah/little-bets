import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchBets, createBet } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Bet, BetType } from '../types';
import { timeAgo } from '../lib/time';
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

interface HomeProps {
  onSignInClick: () => void;
}

function Home({ onSignInClick }: HomeProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [betType, setBetType] = useState<BetType>('yesno');
  const [options, setOptions] = useState(['', '']);
  const [creating, setCreating] = useState(false);
  const [placeholder] = useState(
    () => PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)]
  );

  useEffect(() => {
    document.title = 'Little Bets';
  }, []);

  useEffect(() => {
    fetchBets()
      .then(setBets)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
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

  async function handleQuickCreate(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed) return;

    if (!user) {
      onSignInClick();
      return;
    }

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

      const bet = await createBet({
        question: trimmed,
        description: null,
        bet_type: betType,
        options: betOptions,
        creator_id: user.id,
        creator_name: user.user_metadata?.full_name ?? user.email ?? null,
      });

      const betUrl = `${window.location.origin}/bet/${bet.code_name}`;
      if (navigator.share) {
        navigator.share({ title: bet.question, url: betUrl }).catch(() => {
          navigator.clipboard.writeText(betUrl);
        });
      } else {
        navigator.clipboard.writeText(betUrl);
      }

      navigate(`/bet/${bet.code_name}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create bet');
      setCreating(false);
    }
  }

  return (
    <div className="page">
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
            className="quick-create-btn"
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
      <div className="quick-create-meta">
        <p className="quick-create-hint">
          Type a question and hit Bet! to create instantly.
          {' '}<Link to="/create">More options</Link>
        </p>
        {question.length > 0 && (
          <span className={`char-count ${question.length >= 180 ? 'warn' : ''}`}>
            {question.length}/200
          </span>
        )}
      </div>

      {error && <p className="error-text">{error}</p>}

      <h2 className="home-title">All Bets</h2>
      {loading ? (
        <p>Loading...</p>
      ) : bets.length === 0 ? (
        <p className="home-empty">No bets yet. Be the first to create one!</p>
      ) : (
        <div className="bet-grid">
          {bets.map(bet => (
            <Link key={bet.id} to={`/bet/${bet.code_name}`} className={`bet-card ${bet.resolved ? 'resolved' : ''}`}>
              <div className="bet-card-type">
                {bet.bet_type === 'yesno' ? 'Yes / No' : 'Multiple Choice'}
                {bet.resolved && bet.winning_option_index !== null && (
                  <span className="bet-card-result">
                    {bet.bet_type === 'yesno'
                      ? (bet.winning_option_index === 0 ? 'Yes' : 'No')
                      : bet.options[bet.winning_option_index]?.text ?? 'Resolved'
                    }
                  </span>
                )}
              </div>
              <h2 className="bet-card-question">{bet.question}</h2>
              {bet.creator_name && (
                <p className="bet-card-creator">by {bet.creator_name}</p>
              )}
              <div className="bet-card-footer">
                <span>{bet.total_predictions} prediction{bet.total_predictions !== 1 ? 's' : ''}</span>
                <span>{timeAgo(bet.created_at)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
