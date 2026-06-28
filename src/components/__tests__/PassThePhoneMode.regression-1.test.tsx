// Regression: ISSUE-014 — Stakes card (Card 1) rendered with empty participants
// Found by /qa on 2026-06-27
// Report: .gstack/qa-reports/qa-report-localhost-5173-2026-06-27.md
//
// Bug: PTPContext loaded participants ONCE on mount; predictionCount updated
// after each LOCK IT IN but participants did not. Tapping "Done? Show Results"
// rendered MomentCard with the stale empty array — "0 locked in", no avatars,
// no option counts. Made Card 1 unshareable.
//
// Fix: handleDone now awaits fetchParticipants(bet.id) and setParticipants
// before transitioning to step='card1'.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PassThePhoneMode from '../PassThePhoneMode';
import type { Bet, BetParticipant } from '../../types';

const freshParticipants: BetParticipant[] = [
  {
    id: 'p1',
    bet_id: 'bet-1',
    participant_name: 'Alex',
    prediction: true,
    option_index: 0,
    created_at: '2026-06-27T05:10:00Z',
  },
  {
    id: 'p2',
    bet_id: 'bet-1',
    participant_name: 'Sam',
    prediction: false,
    option_index: 1,
    created_at: '2026-06-27T05:11:00Z',
  },
];

const fetchParticipants = vi.fn().mockResolvedValue(freshParticipants);

vi.mock('../../lib/supabase', () => ({
  submitPrediction: vi.fn().mockResolvedValue({ id: 'p1' }),
  uploadPhoto: vi.fn().mockResolvedValue(true),
  fetchBetByCodeName: vi.fn(),
  fetchParticipants: (...args: unknown[]) => fetchParticipants(...args),
  fetchBetPhotos: vi.fn().mockResolvedValue(new Map()),
}));

vi.mock('../../lib/analytics', () => ({ track: vi.fn() }));
vi.mock('../../context/ToastContext', () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock('../../lib/image-utils', () => ({
  resizeImage: vi.fn().mockResolvedValue('data:image/jpeg;base64,fake'),
}));

const mockSetParticipants = vi.fn();
const mockSetPhotos = vi.fn();
const mockSetPredictionCount = vi.fn();

vi.mock('../../context/PTPContext', () => ({
  usePTP: () => ({
    bet: currentBet,
    photos: new Map(),
    setPhotos: mockSetPhotos,
    predictionCount: currentBet?.total_predictions ?? 0,
    setPredictionCount: mockSetPredictionCount,
    codeName: currentBet?.code_name ?? '',
    loading: false,
    error: null,
    setBet: vi.fn(),
    // Reproduces the pre-fix state: participants is empty when Card 1 step opens
    // (the bug surfaced precisely when a freshly-created bet had no prior fetch).
    participants: [],
    setParticipants: mockSetParticipants,
  }),
}));

function makeBet(overrides: Partial<Bet> = {}): Bet {
  return {
    id: 'bet-1',
    created_at: '2026-06-27',
    question: 'Who wins tonight?',
    description: null,
    bet_type: 'yesno',
    options: [
      { text: 'Argentina', yes_count: 0, no_count: 0 },
      { text: 'Spain', yes_count: 0, no_count: 0 },
    ],
    code_name: 'who-wins-tonight',
    creator_id: null,
    creator_name: null,
    creator_token: null,
    total_predictions: 2,
    sealed: true,
    resolved: false,
    resolved_at: null,
    winning_option_index: null,
    visibility: 'open',
    resolve_by: null,
    reminder_email: null,
    reminder_sent_at: null,
    followup_sent: false,
    ...overrides,
  };
}

let currentBet: Bet | null = makeBet();

describe('PassThePhoneMode — Card 1 participants refresh', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentBet = makeBet();
    document.documentElement.requestFullscreen = vi.fn().mockResolvedValue(undefined);
  });

  it('refetches participants when Done? Show Results is tapped', async () => {
    render(
      <MemoryRouter>
        <PassThePhoneMode />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Done? Show Results'));

    await waitFor(() => {
      expect(fetchParticipants).toHaveBeenCalledWith('bet-1');
    });
  });

  it('writes refreshed participants into PTPContext before showing Card 1', async () => {
    render(
      <MemoryRouter>
        <PassThePhoneMode />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Done? Show Results'));

    await waitFor(() => {
      expect(mockSetParticipants).toHaveBeenCalledWith(freshParticipants);
    });
  });

  it('still transitions to Card 1 when fetchParticipants rejects', async () => {
    fetchParticipants.mockRejectedValueOnce(new Error('network'));

    render(
      <MemoryRouter>
        <PassThePhoneMode />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Done? Show Results'));

    // The Stakes heading lives inside MomentCard and signals the card1 step
    // rendered even though the participant refresh failed (graceful fallback).
    await waitFor(() => {
      expect(screen.getByText('The Stakes')).toBeTruthy();
    });
  });
});
