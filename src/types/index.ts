export type BetType = 'yesno' | 'multiple_choice';
export type BetVisibility = 'open' | 'link_only';

export interface BetOption {
  text: string;
  yes_count: number;
  no_count: number;
}

export interface Bet {
  id: string;
  created_at: string;
  question: string;
  description: string | null;
  bet_type: BetType;
  options: BetOption[];
  code_name: string;
  creator_id: string | null;
  creator_name: string | null;
  total_predictions: number;
  resolved: boolean;
  resolved_at: string | null;
  winning_option_index: number | null;
  hidden: boolean;
  visibility: BetVisibility;
}

export interface BetParticipant {
  id: string;
  created_at: string;
  bet_id: string;
  participant_name: string;
  prediction: boolean;
  option_index: number;
}
