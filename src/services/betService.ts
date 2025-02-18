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
        status: 'ACTIVE',
        creator_name: formData.creatorName,
      })
      .select()
      .single();

    if (error) throw error;
    return { ...bet, participants: [] };
  },

  endBet: async (betId: string, endedBy: string): Promise<void> => {
    try {
      // First, get the bet to check creator
      const { data: bet, error: fetchError } = await supabase
        .from('bets')
        .select('creator_name')
        .eq('id', betId)
        .single();

      if (fetchError) {
        console.error('Error fetching bet:', fetchError);
        throw new Error('Failed to verify bet creator');
      }

      if (!bet) {
        console.error('Bet not found:', betId);
        throw new Error('Bet not found');
      }

      console.log('Fetched bet:', bet);
      console.log('Creator check:', { endedBy, creator: bet.creator_name });

      if (bet.creator_name !== endedBy) {
        throw new Error(`Only the creator "${bet.creator_name}" can end this bet`);
      }

      const { error: updateError } = await supabase
        .from('bets')
        .update({
          status: 'ENDED',
          ended_by: endedBy,
          ended_at: new Date().toISOString()
        })
        .eq('id', betId);

      if (updateError) {
        console.error('Error updating bet:', updateError);
        throw new Error('Failed to end bet');
      }
    } catch (error) {
      // Log the full error object
      console.error('End bet error details:', {
        error,
        betId,
        endedBy,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
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