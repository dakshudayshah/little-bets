import { useState, useEffect, useCallback } from 'react';
import { track } from '../lib/analytics';
import '../styles/WTPModal.css';

const WTP_PROMPTED_KEY = 'lb_wtp_prompted';
const WTP_SHARE_COUNT_KEY = 'lb_share_count';
const SHARE_THRESHOLD = 3;

export function incrementShareCount(): boolean {
  try {
    const count = parseInt(localStorage.getItem(WTP_SHARE_COUNT_KEY) || '0', 10) + 1;
    localStorage.setItem(WTP_SHARE_COUNT_KEY, String(count));
    const prompted = localStorage.getItem(WTP_PROMPTED_KEY) === 'true';
    return !prompted && count >= SHARE_THRESHOLD;
  } catch {
    return false;
  }
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function WTPModal({ open, onClose }: Props) {
  const [response, setResponse] = useState<'yes' | 'maybe' | 'no' | null>(null);
  const [price, setPrice] = useState<string | null>(null);

  const dismiss = useCallback(() => {
    try { localStorage.setItem(WTP_PROMPTED_KEY, 'true'); } catch {}
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') dismiss();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, dismiss]);

  if (!open) return null;

  function handleResponse(r: 'yes' | 'maybe' | 'no') {
    setResponse(r);
    track('wtp_response', { wtp_response: r });
    if (r === 'no') {
      dismiss();
    }
  }

  function handlePrice(p: string) {
    setPrice(p);
    track('wtp_price', { wtp_response: response, wtp_price: p });
    dismiss();
  }

  return (
    <div className="wtp-overlay" onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}>
      <div className="wtp-modal" role="dialog" aria-modal="true">
        {!response && (
          <>
            <h3 className="wtp-question">You've shared 3 moment cards. Would you pay to keep making these?</h3>
            <div className="wtp-options">
              <button className="wtp-btn" onClick={() => handleResponse('yes')}>Yes, I'd pay</button>
              <button className="wtp-btn" onClick={() => handleResponse('maybe')}>Maybe</button>
              <button className="wtp-btn wtp-btn-secondary" onClick={() => handleResponse('no')}>No, I expect it to be free</button>
            </div>
          </>
        )}
        {(response === 'yes' || response === 'maybe') && !price && (
          <>
            <h3 className="wtp-question">How much per month?</h3>
            <div className="wtp-options">
              <button className="wtp-btn" onClick={() => handlePrice('$1')}>$1</button>
              <button className="wtp-btn" onClick={() => handlePrice('$2')}>$2</button>
              <button className="wtp-btn" onClick={() => handlePrice('$5')}>$5</button>
              <button className="wtp-btn" onClick={() => handlePrice('$10+')}>$10+</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
