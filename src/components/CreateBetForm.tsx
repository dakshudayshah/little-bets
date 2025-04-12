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
  options: string[];
  total_predictions: number;
}

export const CreateBetForm = ({ onSuccess }: CreateBetFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [betType, setBetType] = useState<BetType>('yesno');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<BetFormData | null>(null);
  const [options, setOptions] = useState<string[]>(['', '']);

  const addOption = () => {
    if (options.length < 4) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const formData = new FormData(e.currentTarget);
    const rawOptions = betType === 'yesno' ? ['Yes', 'No'] : options.filter(opt => opt.trim() !== '');
    
    const betData: BetFormData = {
      creator_name: formData.get('creator_name') as string,
      question: formData.get('question') as string,
      description: formData.get('description') as string,
      bettype: betType,
      options: rawOptions,
      total_predictions: 0
    };

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
      // Transform the options into the correct format
      const formattedBetData = {
        ...betData,
        options: betData.options.map(optionText => ({
          text: optionText,
          yes_count: 0,
          no_count: 0
        }))
      };

      const { data, error: submitError } = await createBet(formattedBetData);
      
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
          <div className="bet-type-selector">
            <button
              type="button"
              className={`bet-type-button ${betType === 'yesno' ? 'active' : ''}`}
              onClick={() => setBetType('yesno')}
              disabled={loading}
            >
              Yes/No
            </button>
            <button
              type="button"
              className={`bet-type-button ${betType === 'multiple_choice' ? 'active' : ''}`}
              onClick={() => setBetType('multiple_choice')}
              disabled={loading}
            >
              Multiple Choice
            </button>
          </div>
        </div>

        {betType === 'multiple_choice' && (
          <div className="form-group">
            <label>Options *</label>
            <div className="options-list">
              {options.map((option, index) => (
                <div key={index} className="option-input">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    required
                    maxLength={50}
                    disabled={loading}
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      className="remove-option"
                      onClick={() => removeOption(index)}
                      disabled={loading}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              {options.length < 4 && (
                <button
                  type="button"
                  className="add-option"
                  onClick={addOption}
                  disabled={loading}
                >
                  + Add Option
                </button>
              )}
            </div>
          </div>
        )}

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