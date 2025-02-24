import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { CreateBet } from './pages/CreateBet';
import { BetDetails } from './pages/BetDetails';
import { BetsList } from './pages/BetsList';
import { Header } from './components/Header';
import { useEffect, useState } from 'react';
import { BetWithParticipants } from './types';
import { betService } from './services/betService';

const App = () => {
  const [bets, setBets] = useState<BetWithParticipants[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBets = async () => {
      try {
        const betsData = await betService.getAllBets();
        setBets(betsData);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBets();
  }, []);

  if (isLoading) return <div>Loading...</div>;

  console.log('Available routes:', {
    home: '/',
    bets: '/bets',
    create: '/create',
    betDetails: '/bet/:code'
  });
  console.log('App rendering');
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateBet />} />
        <Route path="/bet/:code" element={<BetDetails />} />
        <Route path="/bets" element={<BetsList bets={bets} />} />
      </Routes>
    </Router>
  );
};

export default App; 