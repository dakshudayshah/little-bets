import type { AriaAttributes, DOMAttributes } from 'react';

// Remove these test types
// type ReactTypeCheck = AriaAttributes;
// type DOMTypeCheck = DOMAttributes<unknown>;

export type BetType = 'MILESTONE' | 'RATING' | 'CHOICE' | 'WORD';

// For CHOICE type bets
export interface ChoiceOptions {
  a: string;
  b: string;
  c: string;
  d: string;
}

// Base interfaces
export interface Participant {
  name: string;
  prediction: string;
  created_at: string;
}

export interface BetParticipant extends Participant {
  id: string;
  bet_id: string;
}

export interface Bet {
  id: string;
  question: string;
  creator_name: string;
  type: BetType;
  code_name: string;
  created_at: string;
  description?: string;
  min_value?: number;
  max_value?: number;
  unit?: string;
  choice_options?: ChoiceOptions;
  participants: Participant[];
}

// Application types
export interface BetWithParticipants extends Bet {
  participants: BetParticipant[]; // Override participants with more specific type
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