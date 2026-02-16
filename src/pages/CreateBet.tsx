import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import CreateBetForm from '../components/CreateBetForm';

interface CreateBetProps {
  onSignInClick: () => void;
}

function CreateBet({ onSignInClick }: CreateBetProps) {
  const { user, loading } = useAuth();

  useEffect(() => {
    document.title = 'Create a Bet - Little Bets';
  }, []);

  if (loading) return <div className="page"><p>Loading...</p></div>;

  if (!user) {
    return (
      <div className="page">
        <h1>Create a Bet</h1>
        <p>You need to sign in to create a bet.</p>
        <button className="form-submit-btn" onClick={onSignInClick}>
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Create a Bet</h1>
      <CreateBetForm />
    </div>
  );
}

export default CreateBet;
