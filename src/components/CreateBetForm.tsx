import { useState, FormEvent, ChangeEvent, memo, useCallback } from 'react';
import { BetType, createBet } from '../lib/supabase';
import '../styles/CreateBetForm.css';

// Helper text for different bet types
const HELPER_TEXT: Record<BetType, string> = {
  yesno: "A simple yes or no prediction.",
  number: "Predict a whole number (days, months, years, etc.). Example: How many days until...?",
  custom: "Create a bet with two custom options. Example: Will it be X or Y?"
};

// Form input component
interface FormInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  as?: 'input' | 'textarea' | 'select';
  options?: Array<{ value: string; label: string }>;
  helperText?: string;
}

const FormInput = memo(({ 
  id, 
  label, 
  value, 
  onChange, 
  placeholder = '', 
  required = false, 
  type = 'text',
  as = 'input',
  options = [],
  helperText
}: FormInputProps) => (
  <div className="form-group">
    <label htmlFor={id}>{label}</label>
    
    {as === 'textarea' ? (
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="form-input"
      />
    ) : as === 'select' ? (
      <select
        id={id}
        value={value}
        onChange={onChange}
        required={required}
        className="form-input"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    ) : (
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="form-input"
      />
    )}
    
    {helperText && <div className="helper-text">{helperText}</div>}
  </div>
));

FormInput.displayName = 'FormInput';

// Main CreateBetForm component
export const CreateBetForm = () => {
  // Form state
  const [creatorName, setCreatorName] = useState('');
  const [betType, setBetType] = useState<BetType | ''>('');
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [customOption1, setCustomOption1] = useState('');
  const [customOption2, setCustomOption2] = useState('');
  const [unit, setUnit] = useState('');
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setCreatorName('');
    setBetType('');
    setQuestion('');
    setDescription('');
    setCustomOption1('');
    setCustomOption2('');
    setUnit('');
  }, []);

  // Handle form submission
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
      
      // Create bet data object with exact column names from the database
      const betData = {
        creator_name: creatorName,
        bettype: betType,
        question,
        description: description.trim() || undefined,
        // code_name will be auto-generated by the database default value
        ...(betType === 'number' ? { 
          unit,
          min_value: 0,  // Default values for min/max
          max_value: 100
        } : {}),
        ...(betType === 'custom' ? { 
          customoption1: customOption1,
          customoption2: customOption2
        } : {})
      };
      
      console.log('Submitting bet data:', betData);
      
      // Submit to Supabase
      const { error: supabaseError } = await createBet(betData);
      
      if (supabaseError) {
        throw supabaseError;
      }
      
      // Reset form
      resetForm();
      setSuccess(true);
      
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
    } catch (err) {
      console.error('Form submission error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render type-specific form fields
  const renderTypeSpecificFields = useCallback(() => {
    if (!betType) return null;
    
    switch (betType) {
      case 'number':
        return (
          <FormInput
            id="unit"
            label="Unit (days, months, etc.)"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="e.g., days, months, years"
            required
          />
        );
      
      case 'custom':
        return (
          <div className="custom-options">
            <FormInput
              id="customOption1"
              label="Option 1"
              value={customOption1}
              onChange={(e) => setCustomOption1(e.target.value)}
              placeholder="First option"
              required
            />
            
            <FormInput
              id="customOption2"
              label="Option 2"
              value={customOption2}
              onChange={(e) => setCustomOption2(e.target.value)}
              placeholder="Second option"
              required
            />
          </div>
        );
      
      default:
        return null;
    }
  }, [betType, unit, customOption1, customOption2]);

  return (
    <div className="create-bet-container">
      <h1>Create a New Bet</h1>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Bet created successfully!</div>}
      
      <form onSubmit={handleSubmit}>
        <FormInput
          id="creatorName"
          label="Your Name"
          value={creatorName}
          onChange={(e) => setCreatorName(e.target.value)}
          placeholder="Enter your name"
          required
        />

        <FormInput
          id="betType"
          label="Bet Type"
          value={betType}
          onChange={(e) => setBetType(e.target.value as BetType)}
          required
          as="select"
          options={[
            { value: '', label: 'Select a type...' },
            { value: 'yesno', label: 'Yes/No' },
            { value: 'number', label: 'Number (days/months/years)' },
            { value: 'custom', label: 'Custom Options' }
          ]}
          helperText={betType ? HELPER_TEXT[betType as BetType] : ''}
        />

        <FormInput
          id="question"
          label="Question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="What's your bet about?"
          required
        />

        {renderTypeSpecificFields()}

        <FormInput
          id="description"
          label="Description (Optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add more details about your bet..."
          as="textarea"
        />

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