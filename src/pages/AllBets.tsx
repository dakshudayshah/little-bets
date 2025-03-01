import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase, Bet } from '../lib/supabase';
import '../styles/AllBets.css';

export const AllBets = () => {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBets = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('bets')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setBets(data || []);
      } catch (err) {
        console.error('Error fetching bets:', err);
        setError('Failed to load bets');
      } finally {
        setLoading(false);
      }
    };

    fetchBets();
  }, []);

  // Helper function to display bet options based on type
  const getBetOptions = (bet: Bet) => {
    switch (bet.bettype) {
      case 'yesno':
        return 'Yes / No';
      case 'number':
        return `Number (${bet.unit || 'units'})`;
      case 'custom':
        return bet.customoption1 && bet.customoption2 
          ? `${bet.customoption1} / ${bet.customoption2}`
          : 'Custom options';
      default:
        return '';
    }
  };

  if (loading) {
    return <div className="loading">Loading bets...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="all-bets-container">
      <h1>All Bets</h1>
      
      {bets.length === 0 ? (
        <div className="no-bets">
          <p>No bets have been created yet.</p>
          <Link to="/create" className="create-bet-button">Create the first bet</Link>
        </div>
      ) : (
        <div className="bets-list">
          {bets.map(bet => (
            <Link to={`/bet/${bet.id}`} key={bet.id} className="bet-card">
              <h2>{bet.question}</h2>
              <div className="bet-meta">
                <span className="bet-type">{bet.bettype.toUpperCase()}</span>
                <span className="bet-options">{getBetOptions(bet)}</span>
              </div>
              {bet.description && <p className="bet-description">{bet.description}</p>}
              <div className="bet-creator">Created by {bet.creator_name}</div>
            </Link>
          ))}
        </div>
      )}
      
      <Link to="/create" className="create-bet-button">Create New Bet</Link>
    </div>
  );
}; 