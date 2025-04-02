import { BetOption } from '../lib/supabase';
import '../styles/BetStats.css';

interface BetStatsProps {
  options: BetOption[];
  totalPredictions: number;
}

export const BetStats = ({ options, totalPredictions }: BetStatsProps) => {
  const calculatePercentage = (count: number) => {
    if (totalPredictions === 0) return 0;
    return (count / totalPredictions) * 100;
  };

  return (
    <div className="bet-stats">
      {options.map((option, index) => {
        const yesPercentage = calculatePercentage(option.yes_count);
        const noPercentage = calculatePercentage(option.no_count);
        const totalVotes = option.yes_count + option.no_count;

        return (
          <div key={index} className="option-stats">
            <div className="option-header">
              <span className="option-text">{option.text}</span>
              <span className="vote-count">{totalVotes} votes</span>
            </div>
            
            <div className="prediction-bars">
              <div className="bar-container">
                <div 
                  className="yes-bar" 
                  style={{ width: `${yesPercentage}%` }}
                >
                  {yesPercentage > 10 && (
                    <span className="bar-label">Yes {yesPercentage.toFixed(1)}%</span>
                  )}
                </div>
                <div 
                  className="no-bar" 
                  style={{ width: `${noPercentage}%` }}
                >
                  {noPercentage > 10 && (
                    <span className="bar-label">No {noPercentage.toFixed(1)}%</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}; 