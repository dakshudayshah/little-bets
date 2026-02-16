import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchBetsByCreator, fetchUserPredictions } from '../lib/supabase';
import type { Bet, BetParticipant } from '../types';
import { timeAgo } from '../lib/time';
import '../styles/Profile.css';

type PredictionWithBet = BetParticipant & { bets: Bet };

function didWin(bet: Bet, p: BetParticipant): boolean {
  if (bet.winning_option_index === null) return false;
  if (bet.bet_type === 'yesno') {
    return bet.winning_option_index === 0 ? p.prediction : !p.prediction;
  }
  return p.option_index === bet.winning_option_index;
}

function Profile() {
  const { user, loading: authLoading } = useAuth();
  const [bets, setBets] = useState<Bet[]>([]);
  const [predictions, setPredictions] = useState<PredictionWithBet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const userName = user.user_metadata?.full_name ?? user.email ?? '';

    Promise.all([
      fetchBetsByCreator(user.id),
      userName ? fetchUserPredictions(userName) : Promise.resolve([]),
    ])
      .then(([betsData, predsData]) => {
        setBets(betsData);
        setPredictions(predsData);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading) return <div className="page"><p>Loading...</p></div>;

  if (!user) {
    return (
      <div className="page">
        <h1>Profile</h1>
        <p>Sign in to see your bets and predictions.</p>
      </div>
    );
  }

  const resolvedPredictions = predictions.filter(p => p.bets.resolved);
  const correct = resolvedPredictions.filter(p => didWin(p.bets, p)).length;

  return (
    <div className="page">
      <h1>Profile</h1>
      <div className="profile-info">
        <p className="profile-name">{user.user_metadata?.full_name ?? user.email}</p>
        <p className="profile-email">{user.email}</p>
        {resolvedPredictions.length > 0 && (
          <p className="profile-record">
            {correct}/{resolvedPredictions.length} correct
            {' '}({Math.round((correct / resolvedPredictions.length) * 100)}%)
          </p>
        )}
      </div>

      <h2 className="profile-section-title">Your Bets</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="error-text">{error}</p>}
      {!loading && bets.length === 0 && (
        <p className="profile-empty">You haven't created any bets yet.</p>
      )}
      {bets.length > 0 && (
        <div className="profile-bet-list">
          {bets.map(bet => (
            <Link key={bet.id} to={`/bet/${bet.code_name}`} className="profile-bet-item">
              <span className="profile-bet-question">{bet.question}</span>
              <span className="profile-bet-meta">
                {bet.visibility === 'link_only' && <span className="profile-link-only-tag">Link Only</span>}
                {bet.total_predictions} prediction{bet.total_predictions !== 1 ? 's' : ''}
              </span>
            </Link>
          ))}
        </div>
      )}

      {predictions.length > 0 && (
        <>
          <h2 className="profile-section-title">Your Predictions</h2>
          <div className="profile-bet-list">
            {predictions.map(p => {
              const bet = p.bets;
              const predLabel = bet.bet_type === 'yesno'
                ? (p.prediction ? 'Yes' : 'No')
                : bet.options[p.option_index]?.text ?? 'Unknown';

              return (
                <Link key={p.id} to={`/bet/${bet.code_name}`} className="profile-bet-item">
                  <div className="profile-prediction-content">
                    <span className="profile-bet-question">{bet.question}</span>
                    <span className="profile-prediction-detail">
                      You said <strong>{predLabel}</strong> · {timeAgo(p.created_at)}
                    </span>
                  </div>
                  <span className="profile-bet-meta">
                    {bet.resolved ? (
                      didWin(bet, p)
                        ? <span className="profile-result-tag correct">Correct</span>
                        : <span className="profile-result-tag wrong">Wrong</span>
                    ) : (
                      <span className="profile-pending-tag">Pending</span>
                    )}
                  </span>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default Profile;
