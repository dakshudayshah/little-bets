import { useState, FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import '../styles/CreateBetForm.css';

type BetType = 'yesno' | 'number' | 'custom';

const HELPER_TEXT: Record<BetType, string> = {
  yesno: "A simple yes or no prediction.",
  number: "Predict a whole number (days, months, years, etc.). Example: How many days until...?",
  custom: "Create a bet with two custom options. Example: Will it be X or Y?"
};

export const CreateBetForm = () => {
  const [creatorName, setCreatorName] = useState('');
  const [betType, setBetType] = useState<BetType | ''>('');
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [customOption1, setCustomOption1] = useState('');
  const [customOption2, setCustomOption2] = useState('');
  const [unit, setUnit] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsSubmitting(true);
    
    try {
      // Form validation
      if (!betType) {
        throw new Error('Please select a bet type');
      }
      
      if (betType === 'custom' && (!customOption1.trim() || !customOption2.trim())) {
        throw new Error('Both custom options are required');
      }
      
      // Create bet data object
      const betData = {
        creator_name: creatorName,
        betType,
        question,
        description: description.trim() || undefined,
        ...(betType === 'number' ? { unit } : {}),
        ...(betType === 'custom' ? { customOption1, customOption2 } : {})
      };
      
      // Submit to Supabase
      const { error: supabaseError } = await supabase.from('bets').insert(betData);
      
      if (supabaseError) throw new Error(supabaseError.message);
      
      // Reset form
      setCreatorName('');
      setBetType('');
      setQuestion('');
      setDescription('');
      setCustomOption1('');
      setCustomOption2('');
      setUnit('');
      setSuccess(true);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-bet-container">
      <h1>Create a New Bet</h1>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Bet created successfully!</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="creatorName">Your Name</label>
          <input
            id="creatorName"
            type="text"
            value={creatorName}
            onChange={(e) => setCreatorName(e.target.value)}
            placeholder="Enter your name"
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="betType">Bet Type</label>
          <select
            id="betType"
            value={betType}
            onChange={(e) => setBetType(e.target.value as BetType)}
            required
            className="form-input"
          >
            <option value="">Select a type...</option>
            <option value="yesno">Yes/No</option>
            <option value="number">Number (days/months/years)</option>
            <option value="custom">Custom Options</option>
          </select>
          {betType && (
            <div className="helper-text">{HELPER_TEXT[betType]}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="question">Question</label>
          <input
            id="question"
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What's your bet about?"
            required
            className="form-input"
          />
        </div>

        {betType === 'number' && (
          <div className="form-group">
            <label htmlFor="unit">Unit (days, months, etc.)</label>
            <input
              id="unit"
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="e.g., days, months, years"
              required
              className="form-input"
            />
          </div>
        )}

        {betType === 'custom' && (
          <div className="custom-options">
            <div className="form-group">
              <label htmlFor="customOption1">Option 1</label>
              <input
                id="customOption1"
                type="text"
                value={customOption1}
                onChange={(e) => setCustomOption1(e.target.value)}
                placeholder="First option"
                required
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="customOption2">Option 2</label>
              <input
                id="customOption2"
                type="text"
                value={customOption2}
                onChange={(e) => setCustomOption2(e.target.value)}
                placeholder="Second option"
                required
                className="form-input"
              />
            </div>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="description">Description (Optional)</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add more details about your bet..."
            className="form-input"
          />
        </div>

        <button 
          type="submit" 
          className="submit-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create Bet'}
        </button>
      </form>
    </div>
  );
}; 