import { useNavigate } from 'react-router-dom';
import { usePTP } from '../context/PTPContext';
import { track } from '../lib/analytics';
import '../styles/PassThePhone.css';

function PTPStart() {
  const { bet, loading, error, codeName } = usePTP();
  const navigate = useNavigate();

  if (loading) return <div className="ptp-overlay"><div className="ptp-container"><p className="ptp-subtitle">Loading...</p></div></div>;
  if (error || !bet) return <div className="ptp-overlay"><div className="ptp-container"><p className="ptp-error">{error || 'Bet not found'}</p></div></div>;

  function handleStart() {
    track('ptp_started', { bet_id: bet!.id });
    navigate(`/bet/${codeName}/ptp`);
  }

  return (
    <div className="ptp-overlay">
      <div className="ptp-container">
        <div className="ptp-step ptp-intro">
          <p className="ptp-occasion-label">
            {bet.bet_type === 'yesno' ? 'Yes / No' : 'Multiple Choice'}
          </p>
          <h1 className="ptp-question">{bet.question}</h1>
          <div className="ptp-rules">
            <p>Pass this phone around the group.</p>
            <p>Everyone picks an answer and locks in.</p>
            <p>No peeking. No take-backs.</p>
          </div>
          <button className="ptp-cta ptp-start-btn" onClick={handleStart}>
            Start passing
          </button>
        </div>
      </div>
    </div>
  );
}

export default PTPStart;
