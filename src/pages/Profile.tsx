import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchBetsByCreator } from '../lib/supabase';
import type { Bet } from '../types';
import '../styles/Profile.css';

function Profile() {
  const { user, loading: authLoading } = useAuth();
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchBetsByCreator(user.id)
      .then(setBets)
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

  return (
    <div className="page">
      <h1>Profile</h1>
      <div className="profile-info">
        <p className="profile-name">{user.user_metadata?.full_name ?? user.email}</p>
        <p className="profile-email">{user.email}</p>
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
                {bet.hidden && <span className="profile-hidden-tag">Hidden</span>}
                {bet.total_predictions} prediction{bet.total_predictions !== 1 ? 's' : ''}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Profile;
