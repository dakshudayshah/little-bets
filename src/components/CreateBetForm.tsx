import { useState, FormEvent } from 'react';

type BetType = 'milestone' | 'rating' | 'choice' | 'word';

const HELPER_TEXT: Record<BetType, string> = {
  milestone: "Enter a date range (in months) when you think this will happen. For example: 0-12 means it could happen anytime in the next year.",
  rating: "Enter a rating range. For example: 1-10 for a typical rating scale.",
  choice: "Enter the possible choices separated by commas. For example: Yes, No, Maybe",
  word: "Enter the possible words or phrases separated by commas. For example: Pizza, Sushi, Burger"
};

export const CreateBetForm = () => {
  const [name, setName] = useState('');
  const [betType, setBetType] = useState<BetType | ''>('');
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // ... submit logic
  };

  return (
    <div className="container">
      <h1>Create a New Bet</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Your Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            <option value="milestone">Milestone Bet</option>
            <option value="rating">Rating Bet</option>
            <option value="choice">Choice Bet</option>
            <option value="word">Word Bet</option>
          </select>
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

        <div className="form-group">
          <label htmlFor="description">Description (Optional)</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={betType ? HELPER_TEXT[betType] : "Add more details about your bet..."}
            className="form-input"
          />
        </div>

        <button type="submit" className="submit-button">
          Create Bet
        </button>
      </form>
    </div>
  );
}; 