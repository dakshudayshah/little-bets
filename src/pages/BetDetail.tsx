import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Bet, fetchBetByCodeName } from '../lib/supabase';
import { PredictionForm } from '../components/PredictionForm';
import { BetStats } from '../components/BetStats';
import '../styles/BetDetail.css';

export const BetDetail = () => {
  const { id: codeName } = useParams();
  const [bet, setBet] = useState<Bet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadBet = async () => {
      if (!codeName) {
        setError('No bet code provided');
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await fetchBetByCodeName(codeName);
        if (error) throw error;
        setBet(data);
      } catch (err) {
        console.error('Error loading bet:', err);
        setError('Failed to load bet');
      } finally {
        setLoading(false);
      }
    };

    loadBet();
  }, [codeName]);

  if (loading) return <div className="loading-state">Loading bet details...</div>;
  if (error) return <div className="error-state">{error}</div>;
  if (!bet) return <div className="error-state">Bet not found</div>;

  return (
    <div className="bet-detail-container">
      <div className="bet-header">
        <h1>{bet.question}</h1>
        <div className="bet-meta">
          <span>Created by {bet.creator_name}</span>
          <span>{bet.total_predictions} predictions</span>
        </div>
        {bet.description && (
          <p className="bet-description">{bet.description}</p>
        )}
      </div>

      <div className="bet-content">
        <BetStats 
          options={bet.options} 
          totalPredictions={bet.total_predictions} 
        />

        <div className="prediction-section">
          <h2>Make Your Prediction</h2>
          <PredictionForm 
            bet={bet} 
            onSuccess={() => {
              if (codeName) {
                fetchBetByCodeName(codeName).then(result => {
                  if (!result.error) setBet(result.data);
                });
              }
            }} 
          />
        </div>
      </div>
    </div>
  );
};