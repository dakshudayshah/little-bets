import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchUserBets, fetchUserPredictions, Bet } from '../lib/supabase';
import '../styles/Profile.css';

export const Profile = () => {
  const { user } = useAuth();
  const [bets, setBets] = useState<Bet[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      
      try {
        const [betsRes, predictionsRes] = await Promise.all([
          fetchUserBets(),
          fetchUserPredictions()
        ]);

        setBets(betsRes.data || []);
        setPredictions(predictionsRes.data || []);
      } catch (err) {
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  if (!user) return <Navigate to="/" />;
  if (loading) return <div className="loading-state">Loading profile...</div>;
  if (error) return <div className="error-state">{error}</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>{user.email?.split('@')[0]}</h1>
        <p className="email">{user.email}</p>
      </div>

      <div className="profile-stats">
        <div className="stat-item">
          <span className="stat-value">{bets.length}</span>
          <span className="stat-label">Bets Created</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{predictions.length}</span>
          <span className="stat-label">Predictions Made</span>
        </div>
      </div>

      <div className="profile-section">
        <h2>Your Bets</h2>
        {bets.length === 0 ? (
          <div className="empty-state">You haven't created any bets yet</div>
        ) : (
          <div className="bets-list">
            {bets.map(bet => (
              <Link to={`/bet/${bet.code_name}`} key={bet.id} className="bet-item">
                <h3>{bet.question}</h3>
                <div className="bet-meta">
                  <span className="bet-type">{bet.bettype}</span>
                  <span>{bet.participants?.length || 0} predictions</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="profile-section">
        <h2>Your Predictions</h2>
        {predictions.length === 0 ? (
          <div className="empty-state">You haven't made any predictions yet</div>
        ) : (
          <div className="predictions-list">
            {predictions.map(pred => (
              <Link to={`/bet/${pred.bet.code_name}`} key={pred.id} className="prediction-item">
                <div className="prediction-content">
                  <h3>{pred.bet.question}</h3>
                  <p className="prediction-value">Your prediction: {pred.prediction}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 