import { useEffect } from 'react';
import { track } from '../lib/analytics';
import CreateBetForm from '../components/CreateBetForm';

function CreateBet() {
  useEffect(() => {
    document.title = 'Create a Bet - Little Bets';
    track('page_viewed', { page: 'create' });
  }, []);

  return (
    <div className="page">
      <h1>Create a Bet</h1>
      <CreateBetForm />
    </div>
  );
}

export default CreateBet;
