import { ChangeEvent, ReactNode } from 'react';
import '../../styles/FormElements.css';

// Form group component
interface FormGroupProps {
  children: ReactNode;
  className?: string;
}

export const FormGroup = ({ children, className = '' }: FormGroupProps) => (
  <div className={`form-group ${className}`}>
    {children}
  </div>
);

// Form label component
interface FormLabelProps {
  htmlFor: string;
  children: ReactNode;
  required?: boolean;
}

export const FormLabel = ({ htmlFor, children, required = false }: FormLabelProps) => (
  <label htmlFor={htmlFor} className="form-label">
    {children}
    {required && <span className="required-indicator">*</span>}
  </label>
);

// Text input component
interface TextInputProps {
  id: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  type?: 'text' | 'email' | 'password' | 'number';
  disabled?: boolean;
  className?: string;
}

export const TextInput = ({
  id,
  value,
  onChange,
  placeholder = '',
  required = false,
  type = 'text',
  disabled = false,
  className = ''
}: TextInputProps) => (
  <input
    id={id}
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    required={required}
    disabled={disabled}
    className={`form-input ${className}`}
  />
);

// Textarea component
interface TextareaProps {
  id: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  className?: string;
}

export const Textarea = ({
  id,
  value,
  onChange,
  placeholder = '',
  required = false,
  disabled = false,
  rows = 4,
  className = ''
}: TextareaProps) => (
  <textarea
    id={id}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    required={required}
    disabled={disabled}
    rows={rows}
    className={`form-textarea ${className}`}
  />
);

// Select component
interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  id: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export const Select = ({
  id,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  required = false,
  disabled = false,
  className = ''
}: SelectProps) => (
  <select
    id={id}
    value={value}
    onChange={onChange}
    required={required}
    disabled={disabled}
    className={`form-select ${className}`}
  >
    {placeholder && (
      <option value="" disabled>
        {placeholder}
      </option>
    )}
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

// Button component
interface ButtonProps {
  children: ReactNode;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const Button = ({
  children,
  type = 'button',
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  className = ''
}: ButtonProps) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`btn btn-${variant} btn-${size} ${className}`}
  >
    {children}
  </button>
);

// Helper text component
interface HelperTextProps {
  children: ReactNode;
  error?: boolean;
}

export const HelperText = ({ children, error = false }: HelperTextProps) => (
  <div className={`helper-text ${error ? 'error' : ''}`}>
    {children}
  </div>
);

// Form error message component
interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage = ({ message }: ErrorMessageProps) => (
  <div className="error-message">{message}</div>
);

// Form success message component
interface SuccessMessageProps {
  message: string;
}

export const SuccessMessage = ({ message }: SuccessMessageProps) => (
  <div className="success-message">{message}</div>
); 