import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/AuthModal.css';

interface AuthModalProps {
  message?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal = ({ message, onClose, onSuccess }: AuthModalProps) => {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      await signInWithGoogle();
      onSuccess();
    } catch (err) {
      setError('Failed to sign in. Please try again.');
      console.error('Sign in error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal">
        <h2>Almost There!</h2>
        <p>{message}</p>
        <p className="note">Don't worry, your form data will be preserved.</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <button 
          onClick={handleSignIn}
          className="google-sign-in-button"
          disabled={loading}
        >
          {loading ? (
            <span className="loading-spinner"></span>
          ) : (
            <>
              <img src="/google-icon.svg" alt="Google" />
              Sign in with Google
            </>
          )}
        </button>
        
        <button 
          onClick={onClose}
          className="cancel-button"
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}; 