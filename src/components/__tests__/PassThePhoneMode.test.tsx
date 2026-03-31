import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PassThePhoneMode from '../PassThePhoneMode';
import type { Bet } from '../../types';

// Mock supabase
vi.mock('../../lib/supabase', () => ({
  submitPrediction: vi.fn().mockResolvedValue({ id: 'p1' }),
}));

// Mock analytics
vi.mock('../../lib/analytics', () => ({
  track: vi.fn(),
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
    resolved: false,
    resolved_at: null,
    winning_option_index: null,
    visibility: 'open',
    ...overrides,
  };
}

describe('PassThePhoneMode', () => {
  const onExit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock requestFullscreen
    document.documentElement.requestFullscreen = vi.fn().mockResolvedValue(undefined);
  });

  it('renders intro step with question', () => {
    render(<PassThePhoneMode bet={makeBet()} onExit={onExit} predictionCount={3} />);
    expect(screen.getByText('Will it rain?')).toBeTruthy();
    expect(screen.getByText('Start')).toBeTruthy();
    expect(screen.getByText('Pass the phone around')).toBeTruthy();
  });

  it('shows prediction count', () => {
    render(<PassThePhoneMode bet={makeBet()} onExit={onExit} predictionCount={5} />);
    expect(screen.getByText('5 predictions')).toBeTruthy();
  });

  it('transitions from intro to name step', async () => {
    render(<PassThePhoneMode bet={makeBet()} onExit={onExit} predictionCount={0} />);
    fireEvent.click(screen.getByText('Start'));
    expect(screen.getByPlaceholderText('Your name')).toBeTruthy();
    expect(screen.getByText('Next')).toBeTruthy();
  });

  it('validates name is required on name step', async () => {
    render(<PassThePhoneMode bet={makeBet()} onExit={onExit} predictionCount={0} />);
    fireEvent.click(screen.getByText('Start'));
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('Enter your name')).toBeTruthy();
  });

  it('transitions from name to pick step', async () => {
    const user = userEvent.setup();
    render(<PassThePhoneMode bet={makeBet()} onExit={onExit} predictionCount={0} />);
    fireEvent.click(screen.getByText('Start'));
    await user.type(screen.getByPlaceholderText('Your name'), 'Alice');
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('Alice, make your call')).toBeTruthy();
    expect(screen.getByText('Yes')).toBeTruthy();
    expect(screen.getByText('No')).toBeTruthy();
  });

  it('shows LOCK IT IN after selecting an option', async () => {
    const user = userEvent.setup();
    render(<PassThePhoneMode bet={makeBet()} onExit={onExit} predictionCount={0} />);
    fireEvent.click(screen.getByText('Start'));
    await user.type(screen.getByPlaceholderText('Your name'), 'Alice');
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Yes'));
    expect(screen.getByText('LOCK IT IN')).toBeTruthy();
  });

  it('shows multiple choice options for MC bets', async () => {
    const user = userEvent.setup();
    const bet = makeBet({
      bet_type: 'multiple_choice',
      options: [
        { text: 'Red', yes_count: 0, no_count: 0 },
        { text: 'Blue', yes_count: 0, no_count: 0 },
        { text: 'Green', yes_count: 0, no_count: 0 },
      ],
    });
    render(<PassThePhoneMode bet={bet} onExit={onExit} predictionCount={0} />);
    fireEvent.click(screen.getByText('Start'));
    await user.type(screen.getByPlaceholderText('Your name'), 'Bob');
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('Red')).toBeTruthy();
    expect(screen.getByText('Blue')).toBeTruthy();
    expect(screen.getByText('Green')).toBeTruthy();
  });

  it('submits prediction on LOCK IT IN and shows confirmation', async () => {
    const { submitPrediction } = await import('../../lib/supabase');
    const user = userEvent.setup();
    render(<PassThePhoneMode bet={makeBet()} onExit={onExit} predictionCount={0} />);

    // Navigate to pick
    fireEvent.click(screen.getByText('Start'));
    await user.type(screen.getByPlaceholderText('Your name'), 'Alice');
    fireEvent.click(screen.getByText('Next'));

    // Select and lock
    fireEvent.click(screen.getByText('Yes'));
    fireEvent.click(screen.getByText('LOCK IT IN'));

    await waitFor(() => {
      expect(submitPrediction).toHaveBeenCalledWith({
        bet_id: 'bet-1',
        participant_name: 'Alice',
        prediction: true,
        option_index: 0,
      });
    });

    // Should show locked confirmation
    await waitFor(() => {
      expect(screen.getByText('Locked in!')).toBeTruthy();
    });
  });

  it('calls onExit when Done is clicked', () => {
    render(<PassThePhoneMode bet={makeBet()} onExit={onExit} predictionCount={0} />);
    fireEvent.click(screen.getByText('Done? Show Results'));
    expect(onExit).toHaveBeenCalled();
  });

  it('shows description when bet has one', () => {
    render(
      <PassThePhoneMode
        bet={makeBet({ description: 'Extra context here' })}
        onExit={onExit}
        predictionCount={0}
      />
    );
    expect(screen.getByText('Extra context here')).toBeTruthy();
  });
});
