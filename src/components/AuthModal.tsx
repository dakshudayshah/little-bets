import { useAuth } from '../context/AuthContext';
import '../styles/AuthModal.css';

interface AuthModalProps {
  onClose: () => void;
  message: string;
  onSuccess?: () => void;
}

export const AuthModal = ({ onClose, message, onSuccess }: AuthModalProps) => {
  const { signInWithGoogle } = useAuth();

  const handleSignIn = async () => {
    await signInWithGoogle();
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal">
        <h2>Sign In Required</h2>
        <p>{message}</p>
        <button 
          className="google-sign-in-button"
          onClick={handleSignIn}
        >
          Sign in with Google
        </button>
        <button 
          className="cancel-button"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}; 