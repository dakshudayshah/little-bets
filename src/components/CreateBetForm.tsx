import { useState, FormEvent, useEffect } from 'react';
import { createBet, BetType } from '../lib/supabase';
import '../styles/CreateBetForm.css';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';

interface CreateBetFormProps {
  onSuccess: (codeName: string) => void;
}

export const CreateBetForm = ({ onSuccess }: CreateBetFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [betType, setBetType] = useState<BetType>('yesno');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<{
    creator_name: string;
    question: string;
    description: string;
    bettype: BetType;
    customoption1?: string;
    customoption2?: string;
  } | null>(null);
  const [creatorName, setCreatorName] = useState(user?.email?.split('@')[0] || '');
  
  useEffect(() => {
    if (user?.email) {
      setCreatorName(user.email.split('@')[0]);
    }
  }, [user]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    const betData = {
      creator_name: formData.get('creator_name') as string,
      question: formData.get('question') as string,
      description: formData.get('description') as string,
      bettype: betType,
      customoption1: betType === 'custom' ? formData.get('customoption1') as string : undefined,
      customoption2: betType === 'custom' ? formData.get('customoption2') as string : undefined,
    };

    // Store form data before checking auth
    if (!user) {
      setPendingFormData(betData);
      setShowAuthModal(true);
      setLoading(false);
      return;
    }

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

  const handleAuthSuccess = () => {
    if (pendingFormData) {
      // Create a form element and submit event
      const form = document.createElement('form');
      const event = new Event('submit', { 
        bubbles: true, 
        cancelable: true 
      }) as SubmitEvent;
      
      // Set the form as the target
      Object.defineProperty(event, 'target', { value: form });
      
      // Add the pending form data to the form
      Object.entries(pendingFormData).forEach(([key, value]) => {
        if (value) {
          const input = document.createElement('input');
          input.name = key;
          input.value = value;
          form.appendChild(input);
        }
      });

      // Call handleSubmit with the event
      handleSubmit(event as unknown as FormEvent<HTMLFormElement>);
    }
    setShowAuthModal(false);
    setPendingFormData(null);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="create-bet-form" noValidate>
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
            disabled={loading}
            value={creatorName}
            onChange={(e) => setCreatorName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="bettype">Bet Type *</label>
          <select
            id="bettype"
            value={betType}
            onChange={(e) => setBetType(e.target.value as BetType)}
            required
            disabled={loading}
          >
            <option value="yesno">Yes or No</option>
            <option value="custom">Multiple Choice</option>
          </select>
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
            rows={3}
            maxLength={1000}
            placeholder="Add more details about your bet (optional)"
            disabled={loading}
          />
        </div>

        {betType === 'custom' && (
          <div className="custom-inputs">
            <div className="form-group">
              <label htmlFor="customoption1">First Option *</label>
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
              <label htmlFor="customoption2">Second Option *</label>
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
          </div>
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
          message="Please sign in to create your bet"
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </>
  );
}; 