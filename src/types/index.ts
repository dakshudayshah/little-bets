export type BetType = 'GENDER' | 'SCALE' | 'DURATION';
export type BetStatus = 'ACTIVE' | 'ENDED';

// Database types
export interface Bet {
  id: string;
  code_name: string;
  created_at: string;
  type: BetType;
  question: string;
  description?: string;
  status: BetStatus;
  ended_by?: string;
  ended_at?: string;
  creator_name: string;
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
  creatorName: string;
} 