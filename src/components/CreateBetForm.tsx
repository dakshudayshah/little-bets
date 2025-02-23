const HELPER_TEXT = {
  milestone: "Enter a date range (in months) when you think this will happen. For example: 0-12 means it could happen anytime in the next year.",
  rating: "Enter a rating range. For example: 1-10 for a typical rating scale.",
  choice: "Enter the possible choices separated by commas. For example: Yes, No, Maybe",
  word: "Enter the possible words or phrases separated by commas. For example: Pizza, Sushi, Burger"
};

export const CreateBetForm = () => {
  // ... existing state

  return (
    <div className="container">
      <h1>Create a New Bet</h1>
      <form onSubmit={handleSubmit}>
        {/* ... other form fields */}

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

        {/* Remove Duration Range field */}
        
        {/* ... rest of the form */}
      </form>
    </div>
  );
}; 