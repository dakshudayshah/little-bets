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
    .eq('visibility', 'open')
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
  creator_id: string | null;
  creator_name: string | null;
  creator_token?: string;
  visibility?: string;
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

export async function resolveBetAnonymous(
  betId: string,
  winningOptionIndex: number,
  token: string
): Promise<Bet> {
  const { data, error } = await supabase.rpc('resolve_bet', {
    p_bet_id: betId,
    p_winning_option: winningOptionIndex,
    p_token: token,
  });

  if (error) throw error;
  // RPC RETURNS SETOF → data is an array
  const rows = data as Bet[];
  if (!rows || rows.length === 0) throw new Error('Bet not found or already resolved');
  return rows[0];
}

export async function checkCreator(betId: string, token: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('check_creator', {
    p_bet_id: betId,
    p_token: token,
  });

  if (error) return false;
  return data === true;
}

export async function updateBetVisibility(betId: string, visibility: string): Promise<Bet> {
  const { data, error } = await supabase
    .from('bets')
    .update({ visibility })
    .eq('id', betId)
    .select()
    .single();

  if (error) throw error;
  return data as Bet;
}

// --- Participant queries ---

export async function fetchParticipants(betId: string): Promise<BetParticipant[]> {
  const { data, error } = await supabase
    .from('sealed_bet_participants')
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

export async function deletePrediction(predictionId: string): Promise<void> {
  const { error } = await supabase
    .from('bet_participants')
    .delete()
    .eq('id', predictionId);

  if (error) throw error;
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

// --- Photo Storage ---

function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',');
  const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bytes = atob(parts[1]);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

/**
 * Upload a photo to Supabase Storage with exponential backoff retry.
 * Standalone function — survives React component unmount.
 * sessionStorage is cleared only after confirmed upload.
 */
export async function uploadPhoto(
  betId: string,
  participantName: string,
  dataUrl: string
): Promise<boolean> {
  let blob: Blob;
  try {
    blob = dataUrlToBlob(dataUrl);
  } catch {
    return false;
  }

  const path = `${betId}/${encodeURIComponent(participantName.trim())}.jpg`;
  const delays = [1000, 2000, 4000];

  for (let attempt = 0; attempt <= delays.length; attempt++) {
    const { error } = await supabase.storage
      .from('ptp-photos')
      .upload(path, blob, { upsert: true, contentType: 'image/jpeg' });

    if (!error) return true;

    if (attempt < delays.length) {
      await new Promise(r => setTimeout(r, delays[attempt]));
    }
  }

  return false;
}

/**
 * Fetch all photo URLs for a bet from Supabase Storage.
 * Returns a Map of participantName → public URL.
 */
export async function fetchBetPhotos(betId: string): Promise<Map<string, string>> {
  const photos = new Map<string, string>();

  try {
    const { data, error } = await supabase.storage
      .from('ptp-photos')
      .list(betId);

    if (error || !data) return photos;

    for (const file of data) {
      const name = decodeURIComponent(file.name.replace(/\.jpg$/, ''));
      const { data: urlData } = supabase.storage
        .from('ptp-photos')
        .getPublicUrl(`${betId}/${file.name}`);
      if (urlData?.publicUrl) {
        photos.set(name, urlData.publicUrl);
      }
    }
  } catch {
    // Storage unavailable, return empty map (silent fallback to initials)
  }

  return photos;
}
