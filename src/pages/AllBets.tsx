import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/AllBets.css';

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

export const AllBets = () => {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch bets from API or database
    const fetchBets = async () => {
      try {
        // Replace with actual API call
        // const { data, error } = await supabase.from('bets').select('*');
        
        // Mock data for now
        const mockBets: Bet[] = [
          {
            id: '1',
            created_at: new Date().toISOString(),
            name: 'John',
            betType: 'yesno',
            question: 'Will it rain tomorrow?',
            description: 'Based on the weather forecast'
          },
          {
            id: '2',
            created_at: new Date().toISOString(),
            name: 'Sarah',
            betType: 'number',
            question: 'How many days until the project deadline?',
            description: 'The team is working hard'
          },
          {
            id: '3',
            created_at: new Date().toISOString(),
            name: 'Mike',
            betType: 'custom',
            question: 'Who will win the game?',
            customOption1: 'Team A',
            customOption2: 'Team B',
            description: 'The big rivalry match'
          }
        ];
        
        setBets(mockBets);
      } catch (error) {
        console.error('Error fetching bets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBets();
  }, []);

  // Helper function to display bet options based on type
  const getBetOptions = (bet: Bet) => {
    switch (bet.betType) {
      case 'yesno':
        return 'Yes / No';
      case 'number':
        return 'Number prediction';
      case 'custom':
        return bet.customOption1 && bet.customOption2 
          ? `${bet.customOption1} / ${bet.customOption2}`
          : 'Custom options';
      default:
        return '';
    }
  };

  if (loading) {
    return <div className="loading">Loading bets...</div>;
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
                <span className="bet-type">{bet.betType.toUpperCase()}</span>
                <span className="bet-options">{getBetOptions(bet)}</span>
              </div>
              {bet.description && <p className="bet-description">{bet.description}</p>}
              <div className="bet-creator">Created by {bet.name}</div>
            </Link>
          ))}
        </div>
      )}
      
      <Link to="/create" className="create-bet-button">Create New Bet</Link>
    </div>
  );
}; 