import type { Bet } from '../types';
import '../styles/BetStats.css';

interface BetStatsProps {
  bet: Bet;
  hidden?: boolean;
}

function BetStats({ bet, hidden }: BetStatsProps) {
  if (bet.bet_type === 'yesno') {
    const yesCount = bet.options[0]?.yes_count ?? 0;
    const noCount = bet.options[0]?.no_count ?? 0;
    const total = yesCount + noCount;
    const yesPercent = total > 0 ? Math.round((yesCount / total) * 100) : 50;
    const noPercent = total > 0 ? 100 - yesPercent : 50;

    return (
      <div className={`bet-stats ${hidden ? 'stats-hidden' : ''}`}>
        {hidden && <div className="stats-overlay">Predict to see results</div>}
        <div className="stat-row">
          <div className="stat-labels">
            <span className="stat-label yes">Yes ({hidden ? '?' : yesCount})</span>
            <span className="stat-label no">No ({hidden ? '?' : noCount})</span>
          </div>
          <div className="stat-bar">
            <div className="stat-bar-fill yes" style={{ width: hidden ? '50%' : `${yesPercent}%` }}>
              {!hidden && total > 0 && `${yesPercent}%`}
            </div>
            <div className="stat-bar-fill no" style={{ width: hidden ? '50%' : `${noPercent}%` }}>
              {!hidden && total > 0 && `${noPercent}%`}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Multiple choice
  const totalVotes = bet.options.reduce((sum, opt) => sum + opt.yes_count, 0);

  return (
    <div className={`bet-stats ${hidden ? 'stats-hidden' : ''}`}>
      {hidden && <div className="stats-overlay">Predict to see results</div>}
      {bet.options.map((option, index) => {
        const percent = totalVotes > 0 ? Math.round((option.yes_count / totalVotes) * 100) : 0;
        return (
          <div key={index} className="stat-option">
            <div className="stat-option-header">
              <span className="stat-option-text">{option.text}</span>
              <span className="stat-option-count">{hidden ? '?' : option.yes_count} vote{option.yes_count !== 1 ? 's' : ''}</span>
            </div>
            <div className="stat-bar">
              <div className="stat-bar-fill primary" style={{ width: hidden ? '25%' : `${percent}%` }}>
                {!hidden && percent > 0 && `${percent}%`}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default BetStats;
