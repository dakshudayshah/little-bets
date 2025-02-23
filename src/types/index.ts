export type BetType = 'MILESTONE' | 'RATING' | 'CHOICE' | 'WORD';

// For CHOICE type bets
export interface ChoiceOptions {
  a: string;
  b: string;
  c: string;
  d: string;
}

// Database types
export interface Bet {
  id: string;
  code_name: string;
  created_at: string;
  type: BetType;
  question: string;
  description?: string;
  creator_name: string;
  choice_options?: ChoiceOptions;  // For CHOICE type
  min_value?: number;  // For MILESTONE/RATING bets
  max_value?: number;  // For MILESTONE/RATING bets
  unit?: string;      // For MILESTONE bets (e.g., "months", "years")
}

export interface BetParticipant {
  id: string;
  bet_id: string;
  name: string;
  prediction: string;
  created_at: string;
}

// Application types
export interface BetWithParticipants extends Bet {
  participants: BetParticipant[];
}

export interface CreateBetForm {
  type: BetType;
  question: string;
  description?: string;
  creator_name: string;
  min_value?: number;
  max_value?: number;
  unit?: string;
}

declare global {
  namespace JSX {
    interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
      'data-label'?: string;
    }
  }
}