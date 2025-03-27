import { useState, FormEvent, useEffect } from 'react';
import { Bet, addBetParticipant } from '../lib/supabase';
import '../styles/PredictionForm.css';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';

interface PredictionFormProps {
  bet: Bet;
  onSuccess: () => void;
}

export const PredictionForm = ({ bet, onSuccess }: PredictionFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);
  const [participantName, setParticipantName] = useState(user?.email?.split('@')[0] || '');

  useEffect(() => {
    if (user?.email) {
      setParticipantName(user.email.split('@')[0]);
    }
  }, [user]);

  const validatePrediction = (prediction: string): boolean => {
    switch (bet.bettype) {
      case 'yesno':
        return prediction === 'yes' || prediction === 'no';
      case 'custom':
        return prediction.toLowerCase() === (bet.customoption1?.toLowerCase() || '') || 
               prediction.toLowerCase() === (bet.customoption2?.toLowerCase() || '');
      default:
        return false;
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // Store form data
    const formData = new FormData(e.currentTarget);
    setPendingFormData(formData);

    // Check if user is logged in
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    // Process form submission
    await submitPrediction(formData);
  };

  const submitPrediction = async (formData: FormData) => {
    setLoading(true);
    
    try {
      const name = formData.get('name') as string;
      const prediction = formData.get('prediction') as string;

      if (!name?.trim()) {
        throw new Error('Please enter your name');
      }
      if (!prediction?.trim()) {
        throw new Error('Please make a prediction');
      }
      if (!validatePrediction(prediction)) {
        throw new Error('Invalid prediction value');
      }

      const { error: submitError } = await addBetParticipant({
        bet_id: bet.id,
        name: name.trim(),
        prediction: prediction.trim()
      });

      if (submitError) throw submitError;
      
      onSuccess();
      
    } catch (err) {
      console.error('Error submitting prediction:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit prediction');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = () => {
    if (pendingFormData) {
      submitPrediction(pendingFormData);
    }
    setShowAuthModal(false);
  };

  const renderPredictionInput = () => {
    switch (bet.bettype) {
      case 'yesno':
        return (
          <select
            name="prediction"
            required
            disabled={loading}
          >
            <option value="">Select your prediction</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        );
      
      case 'custom':
        return (
          <select
            name="prediction"
            required
            disabled={loading}
          >
            <option value="">Select your prediction</option>
            {bet.customoption1 && (
              <option value={bet.customoption1}>{bet.customoption1}</option>
            )}
            {bet.customoption2 && (
              <option value={bet.customoption2}>{bet.customoption2}</option>
            )}
          </select>
        );
      
      default:
        return null;
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="prediction-form" noValidate>
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <input
            type="text"
            id="name"
            name="name"
            required
            maxLength={50}
            placeholder="Enter your name"
            disabled={loading}
            value={participantName}
            onChange={(e) => setParticipantName(e.target.value)}
          />
        </div>

        <div className="form-group">
          {renderPredictionInput()}
        </div>

        <button 
          type="submit" 
          className="submit-button" 
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Prediction'}
        </button>
      </form>

      {showAuthModal && (
        <AuthModal
          message="Please sign in to submit your prediction"
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </>
  );
}; 