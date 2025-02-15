import { Link } from 'react-router-dom';
import '../styles/Home.css';

export const Home = () => {
  return (
    <div className="container">
      <div className="content">
        <h1>Little Bets</h1>
        <p>Make friendly bets with your friends on life's little moments</p>
        
        <Link to="/create" className="button">
          Create New Bet
        </Link>
      </div>
    </div>
  );
}; 