/**
 * Creator token management for anonymous bet creation.
 *
 * Tokens are stored in localStorage (primary) with sessionStorage as fallback
 * for Safari private browsing. The URL hash is used as initial delivery mechanism
 * on bet creation, then stripped via history.replaceState.
 */

const storageCache: Partial<Record<'localStorage' | 'sessionStorage', boolean>> = {};

function storageAvailable(type: 'localStorage' | 'sessionStorage'): boolean {
  if (type in storageCache) return storageCache[type]!;
  try {
    const storage = window[type];
    const key = '__storage_test__';
    storage.setItem(key, 'test');
    storage.removeItem(key);
    return (storageCache[type] = true);
  } catch {
    return (storageCache[type] = false);
  }
}

export function saveCreatorToken(betId: string, token: string): void {
  const key = `creator_token_${betId}`;
  if (storageAvailable('localStorage')) {
    localStorage.setItem(key, token);
  } else if (storageAvailable('sessionStorage')) {
    sessionStorage.setItem(key, token);
  }
  // Also track which bets this device created
  saveToMyBets(betId);
}

export function getCreatorToken(betId: string): string | null {
  const key = `creator_token_${betId}`;
  // Check localStorage first, then sessionStorage fallback
  if (storageAvailable('localStorage')) {
    const val = localStorage.getItem(key);
    if (val) return val;
  }
  if (storageAvailable('sessionStorage')) {
    const val = sessionStorage.getItem(key);
    if (val) return val;
  }
  // Check URL hash as final fallback
  return getTokenFromHash();
}

export function getTokenFromHash(): string | null {
  const hash = window.location.hash;
  if (!hash) return null;
  const match = hash.match(/^#token=(.+)$/);
  return match ? match[1] : null;
}

export function setHashToken(token: string): void {
  window.location.hash = `token=${token}`;
}

export function stripHashToken(): void {
  if (window.location.hash.startsWith('#token=')) {
    history.replaceState(null, '', window.location.pathname + window.location.search);
  }
}

export function getShareUrl(codeName: string, theme?: string): string {
  const base = `${window.location.origin}/bet/${codeName}`;
  return theme && theme !== 'neo' ? `${base}?theme=${theme}` : base;
}

export function isStorageAvailable(): boolean {
  return storageAvailable('localStorage') || storageAvailable('sessionStorage');
}

function saveToMyBets(betId: string): void {
  const key = 'my_bets';
  try {
    const storage = storageAvailable('localStorage') ? localStorage : sessionStorage;
    const existing = JSON.parse(storage.getItem(key) || '[]') as string[];
    if (!existing.includes(betId)) {
      existing.push(betId);
      storage.setItem(key, JSON.stringify(existing));
    }
  } catch {
    // Storage full or unavailable, ignore
  }
}
