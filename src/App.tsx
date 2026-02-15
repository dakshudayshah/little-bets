import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import AuthModal from './components/AuthModal';
import Home from './pages/Home';
import BetDetail from './pages/BetDetail';
import CreateBet from './pages/CreateBet';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';

function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <>
      <Header onSignInClick={() => setShowAuthModal(true)} />
      <Routes>
        <Route path="/" element={<Home onSignInClick={() => setShowAuthModal(true)} />} />
        <Route path="/bet/:id" element={<BetDetail />} />
        <Route path="/create" element={<CreateBet onSignInClick={() => setShowAuthModal(true)} />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      <BottomNav />
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  );
}

export default App;
