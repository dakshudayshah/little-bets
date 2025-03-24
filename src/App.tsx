import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Suspense, lazy, Component, ErrorInfo, ReactNode } from 'react';
import './styles/App.css';

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
const Header = () => (
  <header className="app-header">
    <div className="header-content">
      <Link to="/" className="logo">Little Bets</Link>
      <Link to="/create" className="create-bet-button">Create Bet</Link>
    </div>
  </header>
);

// Footer component
const Footer = () => (
  <footer className="app-footer">
    <div className="footer-content">
      <p>&copy; {new Date().getFullYear()} Little Bets. All rights reserved.</p>
    </div>
  </footer>
);

// Main App component
function App() {
  return (
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
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App; 