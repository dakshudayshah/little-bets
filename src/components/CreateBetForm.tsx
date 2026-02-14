import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createBet } from '../lib/supabase';
import type { BetType } from '../types';
import '../styles/CreateBet.css';

function CreateBetForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [betType, setBetType] = useState<BetType>('yesno');
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateOption(index: number, value: string) {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  }

  function addOption() {
    if (options.length < 4) {
      setOptions([...options, '']);
    }
  }

  function removeOption(index: number) {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) {
      setError('Question is required');
      return;
    }

    const betOptions = betType === 'yesno'
      ? [{ text: 'Yes', yes_count: 0, no_count: 0 }, { text: 'No', yes_count: 0, no_count: 0 }]
      : options
          .map(o => o.trim())
          .filter(o => o.length > 0)
          .map(text => ({ text, yes_count: 0, no_count: 0 }));

    if (betType === 'multiple_choice' && betOptions.length < 2) {
      setError('At least 2 options are required');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const bet = await createBet({
        question: trimmedQuestion,
        description: description.trim() || null,
        bet_type: betType,
        options: betOptions,
        creator_id: user.id,
        creator_name: user.user_metadata?.full_name ?? user.email ?? null,
      });
      navigate(`/bet/${bet.code_name}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create bet');
      setSubmitting(false);
    }
  }

  return (
    <form className="create-bet-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">Bet Type</label>
        <div className="bet-type-toggle">
          <button
            type="button"
            className={`bet-type-btn ${betType === 'yesno' ? 'active' : ''}`}
            onClick={() => setBetType('yesno')}
          >
            Yes / No
          </button>
          <button
            type="button"
            className={`bet-type-btn ${betType === 'multiple_choice' ? 'active' : ''}`}
            onClick={() => setBetType('multiple_choice')}
          >
            Multiple Choice
          </button>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="question">Question</label>
        <input
          id="question"
          className="form-input"
          type="text"
          placeholder="Will it rain tomorrow?"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          required
        />
      </div>

      {betType === 'multiple_choice' && (
        <div className="form-group">
          <label className="form-label">Options (2-4)</label>
          {options.map((option, index) => (
            <div key={index} className="option-row">
              <input
                className="form-input"
                type="text"
                placeholder={`Option ${index + 1}`}
                value={option}
                onChange={e => updateOption(index, e.target.value)}
                required
              />
              {options.length > 2 && (
                <button
                  type="button"
                  className="option-remove-btn"
                  onClick={() => removeOption(index)}
                >
                  X
                </button>
              )}
            </div>
          ))}
          {options.length < 4 && (
            <button type="button" className="add-option-btn" onClick={addOption}>
              + Add Option
            </button>
          )}
        </div>
      )}

      <div className="form-group">
        <label className="form-label" htmlFor="description">Description (optional)</label>
        <textarea
          id="description"
          className="form-textarea"
          placeholder="Add context or rules..."
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      {error && <p className="form-error">{error}</p>}

      <button type="submit" className="form-submit-btn" disabled={submitting}>
        {submitting ? 'Creating...' : 'Create Bet'}
      </button>
    </form>
  );
}

export default CreateBetForm;
