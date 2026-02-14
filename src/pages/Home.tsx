import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchBets } from '../lib/supabase';
import type { Bet } from '../types';
import '../styles/Home.css';

function Home() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBets()
      .then(setBets)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page"><p>Loading...</p></div>;
  if (error) return <div className="page"><p className="error-text">Error: {error}</p></div>;

  return (
    <div className="page">
      <h1 className="home-title">All Bets</h1>
      {bets.length === 0 ? (
        <p className="home-empty">No bets yet. Be the first to create one!</p>
      ) : (
        <div className="bet-grid">
          {bets.map(bet => (
            <Link key={bet.id} to={`/bet/${bet.code_name}`} className="bet-card">
              <div className="bet-card-type">
                {bet.bet_type === 'yesno' ? 'Yes / No' : 'Multiple Choice'}
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
