import { createClient } from '@supabase/supabase-js';
import type { Bet, BetParticipant } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- Bet queries ---

export async function fetchBets(): Promise<Bet[]> {
  const { data, error } = await supabase
    .from('bets')
    .select('*')
    .eq('hidden', false)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Bet[];
}

export async function fetchBetByCodeName(codeName: string): Promise<Bet | null> {
  const { data, error } = await supabase
    .from('bets')
    .select('*')
    .eq('code_name', codeName)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // not found
    throw error;
  }
  return data as Bet;
}

export async function fetchBetsByCreator(creatorId: string): Promise<Bet[]> {
  const { data, error } = await supabase
    .from('bets')
    .select('*')
    .eq('creator_id', creatorId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Bet[];
}

export async function createBet(bet: {
  question: string;
  description: string | null;
  bet_type: string;
  options: { text: string; yes_count: number; no_count: number }[];
  creator_id: string;
  creator_name: string | null;
}): Promise<Bet> {
  const { data, error } = await supabase
    .from('bets')
    .insert(bet)
    .select()
    .single();

  if (error) throw error;
  return data as Bet;
}

export async function resolveBet(betId: string, winningOptionIndex: number): Promise<Bet> {
  const { data, error } = await supabase
    .from('bets')
    .update({
      resolved: true,
      resolved_at: new Date().toISOString(),
      winning_option_index: winningOptionIndex,
    })
    .eq('id', betId)
    .select()
    .single();

  if (error) throw error;
  return data as Bet;
}

export async function hideBet(betId: string): Promise<void> {
  const { error } = await supabase
    .from('bets')
    .update({ hidden: true })
    .eq('id', betId);

  if (error) throw error;
}

// --- Participant queries ---

export async function fetchParticipants(betId: string): Promise<BetParticipant[]> {
  const { data, error } = await supabase
    .from('bet_participants')
    .select('*')
    .eq('bet_id', betId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as BetParticipant[];
}

export async function submitPrediction(prediction: {
  bet_id: string;
  participant_name: string;
  prediction: boolean;
  option_index: number;
}): Promise<BetParticipant> {
  const { data, error } = await supabase
    .from('bet_participants')
    .insert(prediction)
    .select()
    .single();

  if (error) throw error;
  return data as BetParticipant;
}

export async function fetchResolvedBetsWithParticipants(): Promise<{ bets: Bet[]; participants: BetParticipant[] }> {
  const { data: bets, error: betsErr } = await supabase
    .from('bets')
    .select('*')
    .eq('resolved', true);

  if (betsErr) throw betsErr;

  const betIds = (bets as Bet[]).map(b => b.id);
  if (betIds.length === 0) return { bets: [], participants: [] };

  const { data: participants, error: partErr } = await supabase
    .from('bet_participants')
    .select('*')
    .in('bet_id', betIds);

  if (partErr) throw partErr;
  return { bets: bets as Bet[], participants: participants as BetParticipant[] };
}

export async function fetchUserPredictions(participantName: string): Promise<(BetParticipant & { bets: Bet })[]> {
  const { data, error } = await supabase
    .from('bet_participants')
    .select('*, bets(*)')
    .eq('participant_name', participantName)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as (BetParticipant & { bets: Bet })[];
}
