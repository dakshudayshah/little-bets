import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BetType } from '../types';
import { betService } from '../services/betService';
import '../styles/CreateBet.css';

export const CreateBet = () => {
  const navigate = useNavigate();
  const [type, setType] = useState<BetType>('GENDER');
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [creatorName, setCreatorName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const bet = await betService.createBet({
        type,
        question,
        description,
        creatorName,
      });
      navigate(`/bet/${bet.code_name}`);
    } catch (err) {
      setError('Failed to create bet. Please try again.');
      console.error('Create bet error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container">
      <div className="content">
        <h1>Create a New Bet</h1>
        
        {error && <p className="error-message">{error}</p>}
        
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="type">Bet Type</label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as BetType)}
              required
              disabled={isSubmitting}
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
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What's your question?"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description (Optional)</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details about your bet..."
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="creatorName">Your Name</label>
            <input
              id="creatorName"
              type="text"
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
              placeholder="Enter your name"
              required
              disabled={isSubmitting}
            />
          </div>

          <button type="submit" className="button" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Bet'}
          </button>
        </form>
      </div>
    </div>
  );
}; 