import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BetType, CreateBetForm, ChoiceOptions } from '../types';
import { betService } from '../services/betService';
import '../styles/CreateBet.css';

interface BetTypeInfo {
  value: BetType;
  label: string;
  example: string;
}

const BET_TYPES: BetTypeInfo[] = [
  {
    value: 'MILESTONE',
    label: 'Milestone Bet',
    example: 'For e.g. in how many months will Baby Luke start walking?'
  },
  {
    value: 'RATING',
    label: 'Rating Bet',
    example: 'For e.g. On a scale of 1-10, how likely are we to have another wedding in the group this year?'
  },
  {
    value: 'CHOICE',
    label: 'Choice Bet',
    example: 'For e.g. What should be our next group event?'
  },
  {
    value: 'WORD',
    label: 'Word Bet',
    example: 'For e.g. In one word, describe John\'s biggest personality quirk.'
  }
];

export const CreateBet = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateBetForm>({
    type: 'MILESTONE',
    question: '',
    description: '',
    creator_name: ''
  });
  const [minValue, setMinValue] = useState<number>(0);
  const [maxValue, setMaxValue] = useState<number>(10);
  const [unit, setUnit] = useState<string>('months');
  const [choiceOptions, setChoiceOptions] = useState<ChoiceOptions>({
    a: '',
    b: '',
    c: '',
    d: ''
  });

  console.log('Form state:', {
    type: formData.type,
    additionalFields: {
      minValue,
      maxValue,
      unit,
      choiceOptions
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate form data based on type
      if (formData.type === 'CHOICE' && !Object.values(choiceOptions).every(v => v.trim())) {
        throw new Error('All choice options must be filled out');
      }

      if ((formData.type === 'MILESTONE' || formData.type === 'RATING') && minValue >= maxValue) {
        throw new Error('Maximum value must be greater than minimum value');
      }

      const betData = {
        ...formData,
        ...(formData.type === 'MILESTONE' || formData.type === 'RATING' ? {
          min_value: minValue,
          max_value: maxValue,
        } : {}),
        ...(formData.type === 'MILESTONE' ? {
          unit: unit.trim(),
        } : {}),
        ...(formData.type === 'CHOICE' ? {
          choice_options: choiceOptions,
        } : {})
      };

      const newBet = await betService.createBet(betData);
      navigate(`/bet/${newBet.code_name}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create bet. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderAdditionalFields = () => {
    switch (formData.type) {
      case 'MILESTONE':
        return (
          <>
            <div className="form-group">
              <label>Duration Range</label>
              <div className="range-inputs">
                <input
                  type="number"
                  value={minValue}
                  onChange={(e) => setMinValue(Number(e.target.value))}
                  placeholder="Min value"
                  required
                />
                <input
                  type="number"
                  value={maxValue}
                  onChange={(e) => setMaxValue(Number(e.target.value))}
                  placeholder="Max value"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Unit</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g., months, years"
                required
              />
            </div>
          </>
        );

      case 'RATING':
        return (
          <div className="form-group">
            <label>Rating Scale</label>
            <div className="range-inputs">
              <input
                type="number"
                value={minValue}
                onChange={(e) => setMinValue(Number(e.target.value))}
                placeholder="Min (default: 1)"
                required
              />
              <input
                type="number"
                value={maxValue}
                onChange={(e) => setMaxValue(Number(e.target.value))}
                placeholder="Max (default: 10)"
                required
              />
            </div>
          </div>
        );

      case 'CHOICE':
        return (
          <div className="form-group">
            <label>Choice Options</label>
            {Object.keys(choiceOptions).map((key) => (
              <input
                key={key}
                type="text"
                value={choiceOptions[key as keyof ChoiceOptions]}
                onChange={(e) => setChoiceOptions({
                  ...choiceOptions,
                  [key]: e.target.value
                })}
                placeholder={`Option ${key.toUpperCase()}`}
                required
              />
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container">
      <div className="content">
        <h1>Create a New Bet</h1>
        
        {error && <p className="error-message">{error}</p>}
        
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="creator_name">Your Name</label>
            <input
              id="creator_name"
              type="text"
              value={formData.creator_name}
              onChange={(e) => setFormData({ ...formData, creator_name: e.target.value })}
              placeholder="Enter your name"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="type">Bet Type</label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as BetType })}
              required
              disabled={isLoading}
            >
              {BET_TYPES.map(betType => (
                <option key={betType.value} value={betType.value}>
                  {betType.label} - {betType.example}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="question">Question</label>
            <input
              id="question"
              type="text"
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              placeholder="What's your question?"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description (Optional)</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add more details about your bet..."
              disabled={isLoading}
            />
          </div>

          {renderAdditionalFields()}

          <button type="submit" className="button" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Bet'}
          </button>
        </form>
      </div>
    </div>
  );
}; 