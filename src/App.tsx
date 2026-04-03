import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import ScrollToTop from './components/ScrollToTop';
import AuthModal from './components/AuthModal';
import Home from './pages/Home';
import BetDetail from './pages/BetDetail';
import CreateBet from './pages/CreateBet';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <>
      <ScrollToTop />
      <Header onSignInClick={() => setShowAuthModal(true)} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/bet/:id" element={<BetDetail />} />
        <Route path="/create" element={<CreateBet />} />

        <Route path="/profile" element={<Profile />} />
        <Route path="/my-bets" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
      <BottomNav />
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  );
}

export default App;
