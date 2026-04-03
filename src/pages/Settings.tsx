import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

const APP_VERSION = '0.1';

function Settings() {
  const { user, signOut } = useAuth();

  return (
    <div className="page">
      <h1>Settings</h1>

      <div style={{ marginBottom: '24px' }}>
        <p style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)', margin: '0 0 8px' }}>Theme</p>
        <ThemeToggle />
      </div>

      {user ? (
        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)', margin: '0 0 8px' }}>Account</p>
          <p style={{ margin: '0 0 12px', fontSize: '0.9rem' }}>{user.user_metadata?.full_name ?? user.email}</p>
          <button
            onClick={signOut}
            style={{ padding: '8px 20px', background: 'none', border: 'var(--border-width) solid var(--color-border)', borderRadius: 'var(--radius)', fontSize: '0.875rem', color: 'var(--color-text)', fontWeight: 500, cursor: 'pointer' }}
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)', margin: '0 0 8px' }}>Account</p>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', margin: 0 }}>Not signed in</p>
        </div>
      )}

      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: 'auto' }}>Little Bets v{APP_VERSION}</p>
    </div>
  );
}

export default Settings;
