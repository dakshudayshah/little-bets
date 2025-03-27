import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchUserBets, fetchUserPredictions, Bet } from '../lib/supabase';
import '../styles/Profile.css';

interface PredictionWithBet {
  id: string;
  created_at: string;
  prediction: string;
  bet: Bet;
}

export const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userBets, setUserBets] = useState<Bet[]>([]);
  const [userPredictions, setUserPredictions] = useState<PredictionWithBet[]>([]);

  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      setError('');

      try {
        const [betsResponse, predictionsResponse] = await Promise.all([
          fetchUserBets(),
          fetchUserPredictions()
        ]);

        if (betsResponse.error) throw betsResponse.error;
        if (predictionsResponse.error) throw predictionsResponse.error;

        setUserBets(betsResponse.data || []);
        setUserPredictions(predictionsResponse.data || []);
      } catch (err) {
        console.error('Error loading user data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return <div className="profile-loading">Loading...</div>;
  }

  return (
    <div className="profile-container">
      <header className="profile-header">
        <h1>Your Profile</h1>
        <p className="profile-email">{user.email}</p>
      </header>

      {error && <div className="error-message">{error}</div>}

      <section className="profile-section">
        <h2>Your Bets</h2>
        {userBets.length === 0 ? (
          <p className="empty-state">You haven't created any bets yet.</p>
        ) : (
          <div className="bets-grid">
            {userBets.map(bet => (
              <Link 
                to={`/bet/${bet.code_name}`} 
                key={bet.id}
                className="bet-card"
              >
                <h3>{bet.question}</h3>
                <div className="bet-meta">
                  <span className="bet-type">{bet.bettype}</span>
                  <span className="bet-date">
                    {new Date(bet.created_at).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="profile-section">
        <h2>Your Predictions</h2>
        {userPredictions.length === 0 ? (
          <p className="empty-state">You haven't made any predictions yet.</p>
        ) : (
          <div className="predictions-grid">
            {userPredictions.map(({ id, prediction, created_at, bet }) => (
              <Link 
                to={`/bet/${bet.code_name}`}
                key={id}
                className="prediction-card"
              >
                <h3>{bet.question}</h3>
                <p className="prediction-value">
                  Your prediction: <strong>{prediction}</strong>
                </p>
                <div className="prediction-meta">
                  <span className="prediction-creator">by {bet.creator_name}</span>
                  <span className="prediction-date">
                    {new Date(created_at).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}; 