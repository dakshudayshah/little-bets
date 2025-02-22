import { supabase } from '../lib/supabase';
import { BetWithParticipants, CreateBetForm, BetParticipant } from '../types';

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
        creator_name: formData.creator_name,
        min_value: formData.min_value,
        max_value: formData.max_value,
        unit: formData.unit
      })
      .select('*')
      .single();

    if (error) throw error;
    
    // Explicitly return the correct type
    return {
      ...bet,
      participants: [] as BetParticipant[]
    };
  },

  getBetByCode: async (code: string): Promise<BetWithParticipants | null> => {
    const { data, error } = await supabase
      .from('bets')
      .select(`
        *,
        participants:bet_participants(*)
      `)
      .eq('code_name', code)
      .single();

    if (error) return null;
    
    // Ensure participants is an array
    return {
      ...data,
      participants: data.participants || []
    };
  },

  getAllBets: async (): Promise<BetWithParticipants[]> => {
    const { data, error } = await supabase
      .from('bets')
      .select(`
        *,
        participants:bet_participants(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Ensure each bet has participants array
    return (data || []).map(bet => ({
      ...bet,
      participants: bet.participants || []
    }));
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