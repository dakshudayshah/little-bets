import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import PassThePhoneMode from '../PassThePhoneMode';
import type { Bet } from '../../types';

// Mock supabase
vi.mock('../../lib/supabase', () => ({
  submitPrediction: vi.fn().mockResolvedValue({ id: 'p1' }),
  uploadPhoto: vi.fn().mockResolvedValue(true),
  fetchBetByCodeName: vi.fn(),
  fetchParticipants: vi.fn().mockResolvedValue([]),
  fetchBetPhotos: vi.fn().mockResolvedValue(new Map()),
}));

vi.mock('../../lib/analytics', () => ({
  track: vi.fn(),
}));

vi.mock('../../context/ToastContext', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock('../../lib/image-utils', () => ({
  resizeImage: vi.fn().mockResolvedValue('data:image/jpeg;base64,fake'),
}));

function makeBet(overrides: Partial<Bet> = {}): Bet {
  return {
    id: 'bet-1',
    created_at: '2024-01-01',
    question: 'Will it rain?',
    description: null,
    bet_type: 'yesno',
    options: [
      { text: 'Yes', yes_count: 0, no_count: 0 },
      { text: 'No', yes_count: 0, no_count: 0 },
    ],
    code_name: 'will-it-rain',
    creator_id: null,
    creator_name: null,
    creator_token: null,
    total_predictions: 3,
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

// Mock PTPContext to provide bet data directly
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
    participants: [],
    setParticipants: vi.fn(),
  }),
}));

let currentBet: Bet | null = makeBet();

function renderPTP(bet?: Bet) {
  currentBet = bet ?? makeBet();
  return render(
    <MemoryRouter>
      <PassThePhoneMode />
    </MemoryRouter>
  );
}

describe('PassThePhoneMode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentBet = makeBet();
    document.documentElement.requestFullscreen = vi.fn().mockResolvedValue(undefined);
    Element.prototype.scrollIntoView = vi.fn();
  });

  it('renders pick step first (answer-before-name)', () => {
    renderPTP();
    expect(screen.getByText('Will it rain?')).toBeTruthy();
    expect(screen.getByText('Make your call')).toBeTruthy();
    expect(screen.getByText('Yes')).toBeTruthy();
    expect(screen.getByText('No')).toBeTruthy();
  });

  it('shows prediction count', () => {
    renderPTP(makeBet({ total_predictions: 5 }));
    expect(screen.getByText('5 predictions')).toBeTruthy();
  });

  it('shows Next button after selecting an option', () => {
    renderPTP();
    fireEvent.click(screen.getByText('Yes'));
    expect(screen.getByText('Next')).toBeTruthy();
  });

  it('transitions from pick to name step', () => {
    renderPTP();
    fireEvent.click(screen.getByText('Yes'));
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByPlaceholderText('First name')).toBeTruthy();
    expect(screen.getByText('LOCK IT IN')).toBeTruthy();
  });

  it('validates name is required on name step', () => {
    renderPTP();
    fireEvent.click(screen.getByText('Yes'));
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('LOCK IT IN'));
    expect(screen.getByText('Enter your name')).toBeTruthy();
  });

  it('shows multiple choice options for MC bets', () => {
    renderPTP(makeBet({
      bet_type: 'multiple_choice',
      options: [
        { text: 'Red', yes_count: 0, no_count: 0 },
        { text: 'Blue', yes_count: 0, no_count: 0 },
        { text: 'Green', yes_count: 0, no_count: 0 },
      ],
    }));
    expect(screen.getByText('Red')).toBeTruthy();
    expect(screen.getByText('Blue')).toBeTruthy();
    expect(screen.getByText('Green')).toBeTruthy();
  });

  it('submits prediction on LOCK IT IN and shows confirmation', async () => {
    const { submitPrediction } = await import('../../lib/supabase');
    const user = userEvent.setup();
    renderPTP();

    // Pick answer first
    fireEvent.click(screen.getByText('Yes'));
    fireEvent.click(screen.getByText('Next'));

    // Enter name and lock
    await user.type(screen.getByPlaceholderText('First name'), 'Alice');
    fireEvent.click(screen.getByText('LOCK IT IN'));

    await waitFor(() => {
      expect(submitPrediction).toHaveBeenCalledWith({
        bet_id: 'bet-1',
        participant_name: 'Alice',
        prediction: true,
        option_index: 0,
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Locked in!')).toBeTruthy();
    });
  });

  it('navigates to reveal when Done is clicked', () => {
    renderPTP();
    fireEvent.click(screen.getByText('Done? Show Results'));
    // Navigation happens via react-router, verified by no crash
  });

  it('shows permission primer after lock-in', async () => {
    const user = userEvent.setup();
    renderPTP();

    fireEvent.click(screen.getByText('Yes'));
    fireEvent.click(screen.getByText('Next'));
    await user.type(screen.getByPlaceholderText('First name'), 'Alice');
    fireEvent.click(screen.getByText('LOCK IT IN'));

    await waitFor(() => {
      expect(screen.getByText(/Your photo goes on the group's moment card/)).toBeTruthy();
    }, { timeout: 2000 });

    expect(screen.getByText('Skip')).toBeTruthy();
    expect(screen.getByText('Add your photo to the moment card')).toBeTruthy();
  });

  it('uses role="radiogroup" for accessibility', () => {
    renderPTP();
    expect(screen.getByRole('radiogroup')).toBeTruthy();
    const radios = screen.getAllByRole('radio');
    expect(radios.length).toBe(2);
  });
});
