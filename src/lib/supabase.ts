import { createClient } from '@supabase/supabase-js';

// Environment variables for Supabase connection
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Bet types
export type BetType = 'yesno' | 'number' | 'custom';

// Bet interface
export interface Bet {
  id: string;
  created_at: string;
  code_name: string;
  creator_name: string;
  bettype: BetType;
  question: string;
  description?: string;
  unit?: string;
  min_value?: number;
  max_value?: number;
  customoption1?: string;
  customoption2?: string;
}

// Bet participant interface
export interface BetParticipant {
  id: string;
  created_at: string;
  bet_id: string;
  name: string;
  prediction: string;
}

// Helper functions for database operations

/**
 * Fetches all bets from the database
 */
export const fetchAllBets = async (): Promise<{ data: Bet[] | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from('bets')
      .select('*')
      .order('created_at', { ascending: false });
    
    return { data, error };
  } catch (error) {
    console.error('Error fetching bets:', error);
    return { data: null, error: error as Error };
  }
};

/**
 * Fetches a single bet by code_name
 */
export const fetchBetByCodeName = async (codeName: string): Promise<{ data: Bet | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from('bets')
      .select('*')
      .eq('code_name', codeName)
      .single();
    
    return { data, error };
  } catch (error) {
    console.error('Error fetching bet:', error);
    return { data: null, error: error as Error };
  }
};

/**
 * Fetches participants for a bet
 */
export const fetchBetParticipants = async (betId: string): Promise<{ data: BetParticipant[] | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from('bet_participants')
      .select('*')
      .eq('bet_id', betId)
      .order('created_at', { ascending: false });
    
    return { data, error };
  } catch (error) {
    console.error('Error fetching participants:', error);
    return { data: null, error: error as Error };
  }
};

/**
 * Creates a new bet
 */
export const createBet = async (betData: Omit<Bet, 'id' | 'created_at' | 'code_name'>): Promise<{ data: Bet | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from('bets')
      .insert(betData)
      .select()
      .single();
    
    return { data, error };
  } catch (error) {
    console.error('Error creating bet:', error);
    return { data: null, error: error as Error };
  }
};

/**
 * Adds a participant to a bet
 */
export const addBetParticipant = async (participantData: Omit<BetParticipant, 'id' | 'created_at'>): Promise<{ data: BetParticipant | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from('bet_participants')
      .insert(participantData)
      .select()
      .single();
    
    return { data, error };
  } catch (error) {
    console.error('Error adding participant:', error);
    return { data: null, error: error as Error };
  }
}; 