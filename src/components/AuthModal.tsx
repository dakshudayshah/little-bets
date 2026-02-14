import { useAuth } from '../context/AuthContext';
import '../styles/AuthModal.css';

interface AuthModalProps {
  onClose: () => void;
}

function AuthModal({ onClose }: AuthModalProps) {
  const { signInWithGoogle } = useAuth();

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={e => e.stopPropagation()}>
        <h2>Sign In</h2>
        <p>Sign in to create bets and track your predictions.</p>
        <button className="auth-google-btn" onClick={signInWithGoogle}>
          Sign in with Google
        </button>
        <button className="auth-close-btn" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default AuthModal;
