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
    value: 'GENDER',
    label: 'Gender Bet',
    example: 'For e.g. Will Baby Sarah be a boy or a girl?'
  },
  {
    value: 'SCALE',
    label: 'Scale Rating',
    example: 'For e.g. On a scale of 1-10, how likely is Tom to get promoted this year?'
  },
  {
    value: 'DURATION',
    label: 'Duration Bet',
    example: 'For e.g. How many months until Sarah and John get engaged?'
  }
];

export const CreateBet = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateBetForm>({
    type: 'GENDER',
    question: '',
    description: '',
    creator_name: ''
  });
  const [choiceOptions, setChoiceOptions] = useState<ChoiceOptions>({
    a: '',
    b: '',
    c: '',
    d: ''
  });
  const [minValue, setMinValue] = useState<number>(0);
  const [maxValue, setMaxValue] = useState<number>(10);
  const [unit, setUnit] = useState<string>('months');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Include additional fields based on bet type
      const betData = {
        ...formData,
        ...(formData.type === 'SCALE' || formData.type === 'DURATION' ? {
          min_value: minValue,
          max_value: maxValue,
        } : {}),
        ...(formData.type === 'DURATION' ? {
          unit: unit,
        } : {})
      };

      const newBet = await betService.createBet(betData);
      navigate(`/bet/${newBet.code_name}`);
    } catch (err) {
      setError('Failed to create bet. Please try again.');
      console.error('Create bet error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderAdditionalFields = () => {
    switch (formData.type) {
      case 'SCALE':
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
      
      case 'DURATION':
        return (
          <>
            <div className="form-group">
              <label>Duration Range</label>
              <div className="range-inputs">
                <input
                  type="number"
                  value={minValue}
                  onChange={(e) => setMinValue(Number(e.target.value))}
                  placeholder="Min months"
                  required
                />
                <input
                  type="number"
                  value={maxValue}
                  onChange={(e) => setMaxValue(Number(e.target.value))}
                  placeholder="Max months"
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