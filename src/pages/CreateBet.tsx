import { useNavigate } from 'react-router-dom';
import { CreateBetForm } from '../components/CreateBetForm';
import '../styles/CreateBet.css';

/**
 * CreateBet page component
 * This is a simple wrapper around the CreateBetForm component
 */
export const CreateBet = () => {
  const navigate = useNavigate();

  return (
    <div className="create-bet-container">
      <div className="create-bet-header">
        <h1>Create a New Bet</h1>
      </div>

      <div className="create-bet-content">
        <CreateBetForm onSuccess={(codeName) => {
          navigate(`/bet/${codeName}`);
        }} />
      </div>
    </div>
  );
}; 