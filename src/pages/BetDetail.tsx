import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../styles/BetDetail.css';

// Define the bet type interface to match our new structure
interface Bet {
  id: string;
  created_at: string;
  name: string;
  betType: 'yesno' | 'number' | 'custom';
  question: string;
  description?: string;
  customOption1?: string;
  customOption2?: string;
}

export const BetDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [bet, setBet] = useState<Bet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBet = async () => {
      try {
        // Replace with actual API call
        // const { data, error } = await supabase.from('bets').select('*').eq('id', id).single();
        
        // Mock data for now
        const mockBets: Record<string, Bet> = {
          '1': {
            id: '1',
            created_at: new Date().toISOString(),
            name: 'John',
            betType: 'yesno',
            question: 'Will it rain tomorrow?',
            description: 'Based on the weather forecast'
          },
          '2': {
            id: '2',
            created_at: new Date().toISOString(),
            name: 'Sarah',
            betType: 'number',
            question: 'How many days until the project deadline?',
            description: 'The team is working hard'
          },
          '3': {
            id: '3',
            created_at: new Date().toISOString(),
            name: 'Mike',
            betType: 'custom',
            question: 'Who will win the game?',
            customOption1: 'Team A',
            customOption2: 'Team B',
            description: 'The big rivalry match'
          }
        };
        
        const foundBet = id ? mockBets[id] : null;
        
        if (foundBet) {
          setBet(foundBet);
        } else {
          setError('Bet not found');
        }
      } catch (error) {
        console.error('Error fetching bet:', error);
        setError('Failed to load bet details');
      } finally {
        setLoading(false);
      }
    };

    fetchBet();
  }, [id]);

  // Helper function to render bet options based on type
  const renderBetOptions = () => {
    if (!bet) return null;

    switch (bet.betType) {
      case 'yesno':
        return (
          <div className="bet-options">
            <button className="option-button">Yes</button>
            <button className="option-button">No</button>
          </div>
        );
      case 'number':
        return (
          <div className="bet-options">
            <input 
              type="number" 
              min="0" 
              placeholder="Enter your prediction" 
              className="number-input"
            />
            <button className="submit-prediction">Submit</button>
          </div>
        );
      case 'custom':
        return (
          <div className="bet-options">
            {bet.customOption1 && (
              <button className="option-button">{bet.customOption1}</button>
            )}
            {bet.customOption2 && (
              <button className="option-button">{bet.customOption2}</button>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="loading">Loading bet details...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <Link to="/bets" className="back-button">Back to All Bets</Link>
      </div>
    );
  }

  if (!bet) {
    return (
      <div className="error-container">
        <p>Bet not found</p>
        <Link to="/bets" className="back-button">Back to All Bets</Link>
      </div>
    );
  }

  return (
    <div className="bet-detail-container">
      <div className="bet-header">
        <h1>{bet.question}</h1>
        <div className="bet-meta">
          <span className="bet-type">{bet.betType.toUpperCase()}</span>
          <span className="bet-creator">Created by {bet.name}</span>
          <span className="bet-date">
            {new Date(bet.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      {bet.description && (
        <div className="bet-description">
          <h2>Description</h2>
          <p>{bet.description}</p>
        </div>
      )}

      <div className="bet-interaction">
        <h2>Make Your Prediction</h2>
        {renderBetOptions()}
      </div>

      <div className="bet-actions">
        <Link to="/bets" className="back-button">Back to All Bets</Link>
      </div>
    </div>
  );
}; 