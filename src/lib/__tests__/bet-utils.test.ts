import { describe, it, expect } from 'vitest';
import { getWinningLabel, didParticipantWin } from '../bet-utils';
import type { Bet, BetParticipant } from '../../types';

function makeBet(overrides: Partial<Bet> = {}): Bet {
  return {
    id: '1',
    created_at: '2024-01-01',
    question: 'Test?',
    description: null,
    bet_type: 'yesno',
    options: [
      { text: 'Yes', yes_count: 1, no_count: 0 },
      { text: 'No', yes_count: 0, no_count: 1 },
    ],
    code_name: 'test',
    creator_id: null,
    creator_name: null,
    creator_token: null,
    total_predictions: 2,
    sealed: false,
    resolved: true,
    resolved_at: '2024-01-02',
    winning_option_index: 0,
    visibility: 'open',
    resolve_by: null,
    reminder_email: null,
    reminder_sent_at: null,
    followup_sent: false,
    ...overrides,
  };
}

function makeParticipant(overrides: Partial<BetParticipant> = {}): BetParticipant {
  return {
    id: 'p1',
    created_at: '2024-01-01',
    bet_id: '1',
    participant_name: 'Alice',
    prediction: true,
    option_index: 0,
    ...overrides,
  };
}

describe('getWinningLabel', () => {
  it('returns empty string when not resolved', () => {
    expect(getWinningLabel(makeBet({ winning_option_index: null }))).toBe('');
  });

  it('returns Yes for yesno bet with index 0', () => {
    expect(getWinningLabel(makeBet({ winning_option_index: 0 }))).toBe('Yes');
  });

  it('returns No for yesno bet with index 1', () => {
    expect(getWinningLabel(makeBet({ winning_option_index: 1 }))).toBe('No');
  });

  it('returns option text for multiple choice', () => {
    const bet = makeBet({
      bet_type: 'multiple_choice',
      options: [
        { text: 'Red', yes_count: 1, no_count: 0 },
        { text: 'Blue', yes_count: 2, no_count: 0 },
        { text: 'Green', yes_count: 0, no_count: 0 },
      ],
      winning_option_index: 1,
    });
    expect(getWinningLabel(bet)).toBe('Blue');
  });

  it('returns Unknown for out-of-bounds index', () => {
    const bet = makeBet({
      bet_type: 'multiple_choice',
      options: [{ text: 'Only', yes_count: 0, no_count: 0 }],
      winning_option_index: 5,
    });
    expect(getWinningLabel(bet)).toBe('Unknown');
  });
});

describe('didParticipantWin', () => {
  it('returns false when not resolved', () => {
    const bet = makeBet({ winning_option_index: null });
    expect(didParticipantWin(bet, makeParticipant())).toBe(false);
  });

  it('yesno: returns true when prediction matches winner (Yes wins, predicted Yes)', () => {
    const bet = makeBet({ winning_option_index: 0 });
    expect(didParticipantWin(bet, makeParticipant({ prediction: true }))).toBe(true);
  });

  it('yesno: returns false when prediction does not match (Yes wins, predicted No)', () => {
    const bet = makeBet({ winning_option_index: 0 });
    expect(didParticipantWin(bet, makeParticipant({ prediction: false }))).toBe(false);
  });

  it('yesno: No wins, predicted No → true', () => {
    const bet = makeBet({ winning_option_index: 1 });
    expect(didParticipantWin(bet, makeParticipant({ prediction: false }))).toBe(true);
  });

  it('multiple choice: correct option wins', () => {
    const bet = makeBet({ bet_type: 'multiple_choice', winning_option_index: 2 });
    expect(didParticipantWin(bet, makeParticipant({ option_index: 2 }))).toBe(true);
  });

  it('multiple choice: wrong option loses', () => {
    const bet = makeBet({ bet_type: 'multiple_choice', winning_option_index: 2 });
    expect(didParticipantWin(bet, makeParticipant({ option_index: 0 }))).toBe(false);
  });

  it('returns false when prediction is sealed (null)', () => {
    const bet = makeBet({ winning_option_index: 0 });
    expect(didParticipantWin(bet, makeParticipant({ prediction: null }))).toBe(false);
  });
});
