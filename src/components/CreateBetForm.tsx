import { useState, FormEvent } from 'react';
import { createBet, BetType } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';
import '../styles/CreateBetForm.css';

interface CreateBetFormProps {
  onSuccess: (codeName: string) => void;
}

interface BetFormData {
  creator_name: string;
  question: string;
  description: string;
  bettype: BetType;
  customoption1?: string;
  customoption2?: string;
}

export const CreateBetForm = ({ onSuccess }: CreateBetFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [betType, setBetType] = useState<BetType>('yesno');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<BetFormData | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const formData = new FormData(e.currentTarget);
    const betData: BetFormData = {
      creator_name: formData.get('creator_name') as string,
      question: formData.get('question') as string,
      description: formData.get('description') as string,
      bettype: betType,
      ...(betType === 'custom' && {
        customoption1: formData.get('customoption1') as string,
        customoption2: formData.get('customoption2') as string,
      })
    };

    // Store form data before checking auth
    if (!user) {
      setPendingFormData(betData);
      setShowAuthModal(true);
      return;
    }

    await submitBet(betData);
  };

  const submitBet = async (betData: BetFormData) => {
    setLoading(true);
    try {
      const { data, error: submitError } = await createBet(betData);
      
      if (submitError) throw submitError;
      if (!data?.code_name) throw new Error('Failed to create bet: No code name returned');
      
      onSuccess(data.code_name);
      
    } catch (err) {
      console.error('Error creating bet:', err);
      setError(err instanceof Error ? err.message : 'Failed to create bet');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = async () => {
    setShowAuthModal(false);
    if (pendingFormData) {
      await submitBet(pendingFormData);
      setPendingFormData(null);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="create-bet-form">
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <label htmlFor="creator_name">Your Name *</label>
          <input
            type="text"
            id="creator_name"
            name="creator_name"
            required
            maxLength={50}
            placeholder="Enter your name"
            defaultValue={user?.email?.split('@')[0] || ''}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="question">Question *</label>
          <input
            type="text"
            id="question"
            name="question"
            required
            maxLength={200}
            placeholder="What do you want to predict?"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            maxLength={1000}
            placeholder="Add any additional details"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Bet Type *</label>
          <div className="bet-type-options">
            <label>
              <input
                type="radio"
                name="bettype"
                value="yesno"
                checked={betType === 'yesno'}
                onChange={(e) => setBetType(e.target.value as BetType)}
                disabled={loading}
              />
              Yes or No
            </label>
            <label>
              <input
                type="radio"
                name="bettype"
                value="custom"
                checked={betType === 'custom'}
                onChange={(e) => setBetType(e.target.value as BetType)}
                disabled={loading}
              />
              Multiple Choice
            </label>
          </div>
        </div>

        {betType === 'custom' && (
          <>
            <div className="form-group">
              <label htmlFor="customoption1">Option 1 *</label>
              <input
                type="text"
                id="customoption1"
                name="customoption1"
                required
                maxLength={50}
                placeholder="Enter first option"
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="customoption2">Option 2 *</label>
              <input
                type="text"
                id="customoption2"
                name="customoption2"
                required
                maxLength={50}
                placeholder="Enter second option"
                disabled={loading}
              />
            </div>
          </>
        )}

        <button 
          type="submit" 
          className="submit-button" 
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Bet'}
        </button>
      </form>

      {showAuthModal && (
        <AuthModal
          message="Sign in to create your bet"
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </>
  );
}; 