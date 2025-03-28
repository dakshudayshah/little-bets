import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Suspense, lazy, Component, ErrorInfo, ReactNode } from 'react';
import './styles/App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Profile } from './pages/Profile';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { BottomNav } from './components/BottomNav';

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
        <div className="header-left">
          <Link to="/" className="logo">Little Bets</Link>
          <nav className="desktop-nav">
            <Link to="/" className="nav-link">Trending</Link>
            <Link to="/markets" className="nav-link">Markets</Link>
          </nav>
        </div>
        
        <div className="header-right">
          {user ? (
            <>
              <Link to="/create" className="create-bet-button">Create Bet</Link>
              <Link to="/profile" className="profile-link">
                {user.email?.split('@')[0]}
              </Link>
              <button onClick={signOut} className="sign-out-button">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button onClick={handleSignIn} className="sign-in-button" disabled={loading}>
                {loading ? <span className="loading-spinner"></span> : 'Log In'}
              </button>
              <button onClick={handleSignIn} className="sign-up-button" disabled={loading}>
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

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
const App = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="app-container">
          <Header />
          <main className="main-content">
            <ErrorBoundary>
              <Suspense fallback={<Loading />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/bet/:id" element={<BetDetail />} />
                  <Route path="/create" element={<CreateBet />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/markets" element={<Home />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </main>
          <BottomNav />
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App; 