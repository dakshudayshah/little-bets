import { useState, FormEvent } from 'react';
import { createBet, BetType, BET_TYPE_NAMES } from '../lib/supabase';
import '../styles/CreateBetForm.css';

interface CreateBetFormProps {
  onSuccess: (codeName: string) => void;
}

export const CreateBetForm = ({ onSuccess }: CreateBetFormProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [betType, setBetType] = useState<BetType>('yesno');
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    
    try {
      // Validate and convert form data
      const creatorName = (formData.get('creator_name') as string)?.trim();
      const question = (formData.get('question') as string)?.trim();
      const description = (formData.get('description') as string)?.trim();
      const unit = (formData.get('unit') as string)?.trim();
      const minValue = formData.get('min_value') ? Number(formData.get('min_value')) : undefined;
      const maxValue = formData.get('max_value') ? Number(formData.get('max_value')) : undefined;
      const customOption1 = (formData.get('customoption1') as string)?.trim();
      const customOption2 = (formData.get('customoption2') as string)?.trim();

      // Validation checks
      if (!creatorName) {
        throw new Error('Please enter your name');
      }
      if (!question) {
        throw new Error('Please enter a question');
      }
      if (betType === 'number') {
        if (minValue === undefined) {
          throw new Error('Please enter a minimum value');
        }
        if (maxValue === undefined) {
          throw new Error('Please enter a maximum value');
        }
        if (maxValue <= minValue) {
          throw new Error('Maximum value must be greater than minimum value');
        }
      }
      if (betType === 'custom') {
        if (!customOption1) {
          throw new Error('Please enter the first option');
        }
        if (!customOption2) {
          throw new Error('Please enter the second option');
        }
      }

      const betData = {
        creator_name: creatorName,
        question,
        description: description || undefined,
        bettype: betType,
        unit: unit || undefined,
        min_value: minValue,
        max_value: maxValue,
        customoption1: customOption1,
        customoption2: customOption2,
      };

      const { data, error: submitError } = await createBet(betData);
      
      if (submitError) throw submitError;
      if (!data?.code_name) throw new Error('Failed to create bet: No code name returned');
      
      form.reset();
      onSuccess(data.code_name);
      
    } catch (err) {
      console.error('Error creating bet:', err);
      setError(err instanceof Error ? err.message : 'Failed to create bet');
      setLoading(false);
    }
  };

  return (
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
          rows={3}
          maxLength={1000}
          placeholder="Add more details about your bet (optional)"
          disabled={loading}
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
          {Object.entries(BET_TYPE_NAMES).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {betType === 'number' && (
        <div className="number-inputs">
          <div className="form-group">
            <label htmlFor="min_value">Minimum Value *</label>
            <input
              type="number"
              id="min_value"
              name="min_value"
              required
              placeholder="0"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="max_value">Maximum Value *</label>
            <input
              type="number"
              id="max_value"
              name="max_value"
              required
              placeholder="100"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="unit">Unit</label>
            <input
              type="text"
              id="unit"
              name="unit"
              maxLength={20}
              placeholder="e.g., points, dollars"
              disabled={loading}
            />
          </div>
        </div>
      )}

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
  );
}; 