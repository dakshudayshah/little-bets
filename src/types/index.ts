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
  creator_token: string | null;
  total_predictions: number;
  sealed: boolean;
  resolved: boolean;
  resolved_at: string | null;
  winning_option_index: number | null;
  visibility: BetVisibility;
  resolve_by: string | null;
  reminder_email: string | null;
  reminder_sent_at: string | null;
  followup_sent: boolean;
}

export interface BetParticipant {
  id: string;
  created_at: string;
  bet_id: string;
  participant_name: string;
  prediction: boolean | null;
  option_index: number | null;
}
