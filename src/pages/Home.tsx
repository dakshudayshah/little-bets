import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchBets, createBet } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Bet } from '../types';
import '../styles/Home.css';

const PLACEHOLDERS = [
  'Will Dave actually run that marathon?',
  'Is pineapple on pizza acceptable?',
  'Will it snow before March?',
  'Can Sarah finish the book club book this month?',
  'Will the meeting end on time today?',
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
  const [creating, setCreating] = useState(false);
  const [placeholder] = useState(
    () => PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)]
  );

  useEffect(() => {
    fetchBets()
      .then(setBets)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleQuickCreate(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed) return;

    if (!user) {
      onSignInClick();
      return;
    }

    setCreating(true);
    try {
      const bet = await createBet({
        question: trimmed,
        description: null,
        bet_type: 'yesno',
        options: [
          { text: 'Yes', yes_count: 0, no_count: 0 },
          { text: 'No', yes_count: 0, no_count: 0 },
        ],
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
        <input
          className="quick-create-input"
          type="text"
          placeholder={placeholder}
          value={question}
          onChange={e => setQuestion(e.target.value)}
          disabled={creating}
        />
        <button
          type="submit"
          className="quick-create-btn"
          disabled={creating || !question.trim()}
        >
          {creating ? '...' : 'Bet!'}
        </button>
      </form>
      <p className="quick-create-hint">
        Type a question and hit Bet! to create a Yes/No bet instantly.
        {' '}<Link to="/create">More options</Link>
      </p>

      {error && <p className="error-text">{error}</p>}

      <h2 className="home-title">All Bets</h2>
      {loading ? (
        <p>Loading...</p>
      ) : bets.length === 0 ? (
        <p className="home-empty">No bets yet. Be the first to create one!</p>
      ) : (
        <div className="bet-grid">
          {bets.map(bet => (
            <Link key={bet.id} to={`/bet/${bet.code_name}`} className="bet-card">
              <div className="bet-card-type">
                {bet.bet_type === 'yesno' ? 'Yes / No' : 'Multiple Choice'}
                {bet.resolved && <span className="bet-card-resolved">Resolved</span>}
              </div>
              <h2 className="bet-card-question">{bet.question}</h2>
              {bet.creator_name && (
                <p className="bet-card-creator">by {bet.creator_name}</p>
              )}
              <div className="bet-card-footer">
                <span>{bet.total_predictions} prediction{bet.total_predictions !== 1 ? 's' : ''}</span>
                <span>{new Date(bet.created_at).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
