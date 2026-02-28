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

function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <>
      <ScrollToTop />
      <Header onSignInClick={() => setShowAuthModal(true)} />
      <Routes>
        <Route path="/" element={<Home onSignInClick={() => setShowAuthModal(true)} />} />
        <Route path="/bet/:id" element={<BetDetail />} />
        <Route path="/create" element={<CreateBet onSignInClick={() => setShowAuthModal(true)} />} />

        <Route path="/profile" element={<Profile />} />
      </Routes>
      <BottomNav />
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  );
}

export default App;
