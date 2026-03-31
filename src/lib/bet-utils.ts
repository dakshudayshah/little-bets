import type { Bet, BetParticipant } from '../types';

export function getWinningLabel(bet: Bet): string {
  if (bet.winning_option_index === null) return '';
  if (bet.bet_type === 'yesno') {
    return bet.winning_option_index === 0 ? 'Yes' : 'No';
  }
  return bet.options[bet.winning_option_index]?.text ?? 'Unknown';
}

export function didParticipantWin(bet: Bet, p: BetParticipant): boolean {
  if (bet.winning_option_index === null || p.prediction === null) return false;
  if (bet.bet_type === 'yesno') {
    return bet.winning_option_index === 0 ? p.prediction : !p.prediction;
  }
  return p.option_index === bet.winning_option_index;
}
