import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Define types for our database schema
export type BetType = 'yesno' | 'number' | 'custom';

export interface Bet {
  id: string;
  created_at: string;
  name: string;
  betType: BetType;
  question: string;
  description?: string;
  customOption1?: string;
  customOption2?: string;
}

export interface Prediction {
  id: string;
  created_at: string;
  bet_id: string;
  user_name: string;
  prediction_value: string; // Could be "yes", "no", a number, or one of the custom options
}

// Helper functions for database operations

export const createBet = async (betData: Omit<Bet, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('bets')
    .insert(betData)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getBets = async () => {
  const { data, error } = await supabase
    .from('bets')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const getBetById = async (id: string) => {
  const { data, error } = await supabase
    .from('bets')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

export const createPrediction = async (predictionData: Omit<Prediction, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('predictions')
    .insert(predictionData)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getPredictionsByBetId = async (betId: string) => {
  const { data, error } = await supabase
    .from('predictions')
    .select('*')
    .eq('bet_id', betId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}; 