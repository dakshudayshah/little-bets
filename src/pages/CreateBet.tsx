import { useNavigate } from 'react-router-dom';
import { CreateBetForm } from '../components/CreateBetForm';
import '../styles/CreateBet.css';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from '../components/AuthModal';

/**
 * CreateBet page component
 * This is a simple wrapper around the CreateBetForm component
 */
export const CreateBet = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  if (!user) {
    return (
      <div className="create-bet-container">
        <div className="auth-required">
          <h2>Sign in Required</h2>
          <p>Please sign in to create a bet</p>
          <AuthModal 
            message="Sign in to create your bet"
            onClose={() => navigate('/')}
            onSuccess={() => {}} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="create-bet-container">
      <div className="create-bet-header">
        <h1>Create a New Bet</h1>
        <p className="subtitle">Set up your prediction market</p>
      </div>

      <div className="create-bet-content">
        <CreateBetForm onSuccess={(codeName) => navigate(`/bet/${codeName}`)} />
      </div>
    </div>
  );
}; 