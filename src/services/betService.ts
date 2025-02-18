import { supabase } from '../lib/supabase';
import { BetWithParticipants, CreateBetForm } from '../types';

// Generate a random 6-character code
const generateCodeName = (): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from(Array(6))
    .map(() => characters.charAt(Math.floor(Math.random() * characters.length)))
    .join('');
};

export const betService = {
  createBet: async (formData: CreateBetForm): Promise<BetWithParticipants> => {
    const codeName = generateCodeName();
    
    const { data: bet, error } = await supabase
      .from('bets')
      .insert({
        code_name: codeName,
        type: formData.type,
        question: formData.question,
        description: formData.description,
      })
      .select()
      .single();

    if (error) throw error;
    return { ...bet, participants: [] };
  },

  getBetByCode: async (code: string): Promise<BetWithParticipants | null> => {
    const { data: bet, error: betError } = await supabase
      .from('bets')
      .select(`
        *,
        participants:bet_participants(*)
      `)
      .eq('code_name', code)
      .single();

    if (betError) return null;
    return bet;
  },

  getAllBets: async (): Promise<BetWithParticipants[]> => {
    const { data: bets, error: betsError } = await supabase
      .from('bets')
      .select(`
        *,
        participants:bet_participants(*)
      `)
      .order('created_at', { ascending: false });

    if (betsError) throw betsError;
    return bets || [];
  },

  addParticipant: async (betId: string, name: string, prediction: string): Promise<void> => {
    const { error } = await supabase
      .from('bet_participants')
      .insert({
        bet_id: betId,
        name,
        prediction,
      });

    if (error) throw error;
  },
}; 