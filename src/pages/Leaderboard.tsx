import { useEffect, useState } from 'react';
import { fetchResolvedBetsWithParticipants } from '../lib/supabase';
import type { Bet, BetParticipant } from '../types';
import '../styles/Leaderboard.css';

interface LeaderboardEntry {
  name: string;
  correct: number;
  total: number;
  accuracy: number;
  streak: number;
}

function didParticipantWin(bet: Bet, p: BetParticipant): boolean {
  if (bet.winning_option_index === null) return false;
  if (bet.bet_type === 'yesno') {
    return bet.winning_option_index === 0 ? p.prediction : !p.prediction;
  }
  return p.option_index === bet.winning_option_index;
}

function computeLeaderboard(bets: Bet[], participants: BetParticipant[]): LeaderboardEntry[] {
  const betMap = new Map(bets.map(b => [b.id, b]));

  // Sort bets by created_at for streak calculation
  const sortedBets = [...bets].sort(
    (a, b) => new Date(a.resolved_at ?? a.created_at).getTime() - new Date(b.resolved_at ?? b.created_at).getTime()
  );
  const betOrder = new Map(sortedBets.map((b, i) => [b.id, i]));

  const stats = new Map<string, { correct: number; total: number; results: { order: number; won: boolean }[] }>();

  for (const p of participants) {
    const bet = betMap.get(p.bet_id);
    if (!bet) continue;

    if (!stats.has(p.participant_name)) {
      stats.set(p.participant_name, { correct: 0, total: 0, results: [] });
    }
    const entry = stats.get(p.participant_name)!;
    const won = didParticipantWin(bet, p);
    entry.total++;
    if (won) entry.correct++;
    entry.results.push({ order: betOrder.get(bet.id) ?? 0, won });
  }

  const entries: LeaderboardEntry[] = [];
  for (const [name, { correct, total, results }] of stats) {
    if (total < 2) continue;

    // Calculate current streak (consecutive correct from most recent)
    results.sort((a, b) => b.order - a.order);
    let streak = 0;
    for (const r of results) {
      if (r.won) streak++;
      else break;
    }

    entries.push({
      name,
      correct,
      total,
      accuracy: Math.round((correct / total) * 100),
      streak,
    });
  }

  entries.sort((a, b) => {
    if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
    if (b.correct !== a.correct) return b.correct - a.correct;
    return b.streak - a.streak;
  });

  return entries;
}

function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResolvedBetsWithParticipants()
      .then(({ bets, participants }) => {
        setEntries(computeLeaderboard(bets, participants));
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page"><p>Loading...</p></div>;
  if (error) return <div className="page"><p className="error-text">Error: {error}</p></div>;

  return (
    <div className="page">
      <h1 className="leaderboard-title">Leaderboard</h1>
      <p className="leaderboard-subtitle">Who called it? (min. 2 resolved predictions)</p>

      {entries.length === 0 ? (
        <p className="leaderboard-empty">
          No one qualifies yet. Resolve some bets to see the leaderboard!
        </p>
      ) : (
        <div className="leaderboard-table">
          <div className="leaderboard-header">
            <span className="lb-rank">#</span>
            <span className="lb-name">Name</span>
            <span className="lb-record">Record</span>
            <span className="lb-accuracy">Accuracy</span>
            <span className="lb-streak">Streak</span>
          </div>
          {entries.map((entry, index) => (
            <div key={entry.name} className={`leaderboard-row ${index < 3 ? `top-${index + 1}` : ''}`}>
              <span className="lb-rank">{index + 1}</span>
              <span className="lb-name">{entry.name}</span>
              <span className="lb-record">{entry.correct}/{entry.total}</span>
              <span className="lb-accuracy">{entry.accuracy}%</span>
              <span className="lb-streak">{entry.streak > 0 ? `${entry.streak}W` : '-'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Leaderboard;
