import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { CreateBet } from './pages/CreateBet';
import { BetDetails } from './pages/BetDetails';
import { BetsList } from './pages/BetsList';
import { Header } from './components/Header';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateBet />} />
        <Route path="/bet/:code" element={<BetDetails />} />
        <Route path="/bets" element={<BetsList />} />
      </Routes>
    </Router>
  );
}

export default App; 