export type BetType = 'GENDER' | 'SCALE' | 'DURATION';

// For GENDER type bets
export interface GenderOptions {
  options: ['BOY', 'GIRL'];
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
  min_value?: number;  // For SCALE/DURATION bets
  max_value?: number;  // For SCALE/DURATION bets
  unit?: string;      // For DURATION bets (e.g., "months", "years")
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