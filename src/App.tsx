import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Suspense, lazy, Component, ErrorInfo, ReactNode } from 'react';
import './styles/App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Profile } from './pages/Profile';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

// Lazy load components for better performance
const BetDetail = lazy(() => import('./pages/BetDetail').then(module => ({ default: module.BetDetail })));
const CreateBet = lazy(() => import('./pages/CreateBet').then(module => ({ default: module.CreateBet })));
const Home = lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));

// Loading component
const Loading = () => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
    <p>Loading...</p>
  </div>
);

// Error boundary component
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h1>Something went wrong</h1>
          <p>{this.state.error?.message || 'An unexpected error occurred'}</p>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="retry-button"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Header component
const Header = () => {
  const { user, signOut, signInWithGoogle } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const handleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
    } catch (err) {
      console.error('Sign in error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <header className="app-header">
      <div className="header-content">
        <Link to="/" className="logo">Little Bets</Link>
        <div className="header-actions">
          <Link to="/create" className="create-bet-button">Create Bet</Link>
          
          {user ? (
            <div className="user-menu-container">
              <button 
                className="user-menu-trigger"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                {user.email?.split('@')[0]}
                <span className="arrow-down">▼</span>
              </button>
              
              {showUserMenu && (
                <div className="user-menu">
                  <Link to="/profile" className="menu-item">
                    My Profile
                  </Link>
                  <button 
                    onClick={() => {
                      signOut();
                      setShowUserMenu(false);
                    }}
                    className="menu-item sign-out"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={handleSignIn}
              className="sign-in-button"
              disabled={loading}
            >
              {loading ? (
                <span className="loading-spinner"></span>
              ) : (
                'Sign In'
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

// Footer component
const Footer = () => (
  <footer className="app-footer">
    <div className="footer-content">
      <p>&copy; {new Date().getFullYear()} Little Bets. All rights reserved.</p>
    </div>
  </footer>
);

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { error } = await supabase.auth.getSession();
        if (error) throw error;
        
        // Redirect to the home page or the page they were trying to access
        navigate('/', { replace: true });
      } catch (err) {
        console.error('Error in auth callback:', err);
        setError('Failed to complete authentication');
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return <Loading />;
};

// Main App component
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Header />
          
          <main className="app-content">
            <ErrorBoundary>
              <Suspense fallback={<Loading />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/bet/:id" element={<BetDetail />} />
                  <Route path="/create" element={<CreateBet />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </main>
          
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App; 