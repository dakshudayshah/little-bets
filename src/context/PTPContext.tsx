import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { fetchBetByCodeName, fetchParticipants, fetchBetPhotos } from '../lib/supabase';
import type { Bet, BetParticipant } from '../types';

interface PTPContextType {
  bet: Bet | null;
  setBet: (bet: Bet) => void;
  participants: BetParticipant[];
  setParticipants: (p: BetParticipant[]) => void;
  photos: Map<string, string>;
  setPhotos: React.Dispatch<React.SetStateAction<Map<string, string>>>;
  predictionCount: number;
  setPredictionCount: React.Dispatch<React.SetStateAction<number>>;
  loading: boolean;
  error: string | null;
  codeName: string;
}

const PTPContext = createContext<PTPContextType | undefined>(undefined);

export function PTPProvider({ children }: { children: ReactNode }) {
  const { id: codeName } = useParams<{ id: string }>();
  const [bet, setBet] = useState<Bet | null>(null);
  const [participants, setParticipants] = useState<BetParticipant[]>([]);
  const [photos, setPhotos] = useState<Map<string, string>>(new Map());
  const [predictionCount, setPredictionCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!codeName) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const betData = await fetchBetByCodeName(codeName);
        if (cancelled) return;
        if (!betData) {
          setError('Bet not found');
          setLoading(false);
          return;
        }
        setBet(betData);
        setPredictionCount(betData.total_predictions);

        const [parts, betPhotos] = await Promise.all([
          fetchParticipants(betData.id),
          fetchBetPhotos(betData.id),
        ]);
        if (cancelled) return;
        setParticipants(parts);
        if (betPhotos.size > 0) setPhotos(betPhotos);
      } catch {
        if (!cancelled) setError('Failed to load bet');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [codeName]);

  return (
    <PTPContext.Provider value={{
      bet, setBet, participants, setParticipants,
      photos, setPhotos, predictionCount, setPredictionCount,
      loading, error, codeName: codeName || '',
    }}>
      {children}
    </PTPContext.Provider>
  );
}

export function usePTP() {
  const ctx = useContext(PTPContext);
  if (!ctx) throw new Error('usePTP must be used within PTPProvider');
  return ctx;
}
