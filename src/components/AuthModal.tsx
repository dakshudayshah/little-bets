import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/AuthModal.css';

interface AuthModalProps {
  onClose: () => void;
}

function AuthModal({ onClose }: AuthModalProps) {
  const { signInWithGoogle, signInWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setSending(true);
    setError(null);
    try {
      await signInWithEmail(trimmed);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send magic link');
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="auth-modal-overlay" onClick={onClose}>
        <div className="auth-modal" onClick={e => e.stopPropagation()}>
          <h2>Check Your Email</h2>
          <p>We sent a sign-in link to <strong>{email}</strong>. Click the link in the email to sign in.</p>
          <button className="auth-close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={e => e.stopPropagation()}>
        <h2>Sign In</h2>
        <p>Sign in to create bets and track your predictions.</p>
        <button className="auth-google-btn" onClick={signInWithGoogle}>
          Sign in with Google
        </button>
        <div className="auth-divider">
          <span>or</span>
        </div>
        <form className="auth-email-form" onSubmit={handleEmailSubmit}>
          <input
            className="auth-email-input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="auth-email-btn"
            disabled={sending || !email.trim()}
          >
            {sending ? 'Sending...' : 'Send Magic Link'}
          </button>
        </form>
        {error && <p className="auth-error">{error}</p>}
        <button className="auth-close-btn" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default AuthModal;
