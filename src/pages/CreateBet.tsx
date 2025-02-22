import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BetType, CreateBetForm } from '../types';
import { betService } from '../services/betService';
import '../styles/CreateBet.css';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const newBet = await betService.createBet(formData);
      navigate(`/bet/${newBet.code_name}`);
    } catch (err) {
      setError('Failed to create bet. Please try again.');
      console.error('Create bet error:', err);
    } finally {
      setIsLoading(false);
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
              <option value="GENDER">Baby Gender</option>
              <option value="SCALE">Scale Rating (1-10)</option>
              <option value="DURATION">Duration (Months)</option>
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

          <button type="submit" className="button" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Bet'}
          </button>
        </form>
      </div>
    </div>
  );
}; 