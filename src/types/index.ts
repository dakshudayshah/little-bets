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

// Database types
export interface Bet {
  id: string;
  code: string;
  question: string;
  type: string;
  creator_name: string;
  description?: string;
  created_at: string;
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
  participants: {
    id: string;
    name: string;
    prediction: string;
    created_at: string;
  }[];
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