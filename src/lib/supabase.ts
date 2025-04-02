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

// Bet types with display names
export type BetType = 'yesno' | 'multiple';

export const BET_TYPE_NAMES: Record<BetType, string> = {
  yesno: 'Yes or No',
  multiple: 'Multiple Choice'
};

// Database interfaces
export interface BetOption {
  text: string;
  yes_count: number;
  no_count: number;
}

export interface Bet {
  id: string;
  created_at: string;
  creator_id: string;
  creator_name: string;
  code_name: string;
  question: string;
  description?: string;
  bettype: BetType;
  options: BetOption[];  // For both yes/no and multiple choice
  total_predictions: number;
}

export interface BetParticipant {
  id: string;
  created_at: string;
  bet_id: string;
  name: string;
  prediction: string;
  user_id?: string;  // Optional since we don't require auth
}

// Error handling helper
const handleError = (error: unknown) => {
  console.error('Database operation failed:', error);
  return {
    data: null,
    error: error instanceof Error ? error : new Error('An unexpected error occurred')
  };
};

/**
 * Fetches all bets, sorted by creation date
 */
export const fetchAllBets = async () => {
  try {
    const { data, error } = await supabase
      .from('bets')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return handleError(error);
  }
};

/**
 * Fetches a single bet by its code_name
 */
export const fetchBetByCodeName = async (codeName: string) => {
  try {
    const { data, error } = await supabase
      .from('bets')
      .select('*')
      .eq('code_name', codeName)
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return handleError(error);
  }
};

/**
 * Fetches all participants for a specific bet
 */
export const fetchBetParticipants = async (betId: string) => {
  try {
    const { data, error } = await supabase
      .from('bet_participants')
      .select('*')
      .eq('bet_id', betId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return handleError(error);
  }
};

/**
 * Creates a new bet
 * The code_name will be automatically generated by the database trigger
 */
export const createBet = async (betData: Omit<Bet, 'id' | 'created_at' | 'creator_id' | 'code_name'>) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { data: null, error: new Error('User not authenticated') };
  }

  return supabase
    .from('bets')
    .insert({
      ...betData,
      creator_id: user.id
    })
    .select('code_name')
    .single();
};

/**
 * Adds a new participant prediction to a bet
 */
export const addBetParticipant = async (participantData: {
  bet_id: string;
  name: string;
  option_index: number;
  prediction: string;
}) => {
  try {
    // Get user if logged in (optional)
    const { data: { user } } = await supabase.auth.getUser();
    
    console.log('Adding bet participant:', participantData);
    
    const { data, error } = await supabase
      .from('bet_participants')
      .insert({
        ...participantData,
        // Only add user_id if user exists
        ...(user ? { user_id: user.id } : {})
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding bet participant:', error);
      return { error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in addBetParticipant:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('An unexpected error occurred') 
    };
  }
};

/**
 * Fetches all bets created by a specific user
 */
export const fetchUserBets = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { data: null, error: new Error('User not authenticated') };
  }

  try {
    const { data, error } = await supabase
      .from('bets')
      .select('*')
      .eq('creator_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return handleError(error);
  }
};

/**
 * Fetches all predictions made by a specific user
 */
export const fetchUserPredictions = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { data: null, error: new Error('User not authenticated') };
  }

  try {
    const { data, error } = await supabase
      .from('bet_participants')
      .select(`
        *,
        bet:bets (
          id,
          question,
          bettype,
          code_name,
          creator_name
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return handleError(error);
  }
};

export const logAuthEvent = async (event: string, details?: any) => {
  if (import.meta.env.PROD) {
    console.log(`Auth Event [${event}]:`, details);
    
    try {
      await supabase
        .from('auth_logs')
        .insert([
          {
            event,
            details: JSON.stringify(details),
            timestamp: new Date().toISOString()
          }
        ]);
    } catch (error) {
      console.error('Failed to log auth event:', error);
    }
  }
}; 