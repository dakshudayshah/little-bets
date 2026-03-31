import { describe, it, expect, beforeEach } from 'vitest';
import { saveCreatorToken, getCreatorToken, getShareUrl, isStorageAvailable } from '../creator-token';

describe('creator-token', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('saveCreatorToken / getCreatorToken', () => {
    it('saves and retrieves a token from localStorage', () => {
      saveCreatorToken('bet-123', 'tok-abc');
      expect(getCreatorToken('bet-123')).toBe('tok-abc');
    });

    it('returns null for unknown bet', () => {
      expect(getCreatorToken('nonexistent')).toBeNull();
    });

    it('tracks bet in my_bets list', () => {
      saveCreatorToken('bet-1', 'tok-1');
      saveCreatorToken('bet-2', 'tok-2');
      const myBets = JSON.parse(localStorage.getItem('my_bets') || '[]');
      expect(myBets).toContain('bet-1');
      expect(myBets).toContain('bet-2');
    });

    it('does not duplicate bet in my_bets', () => {
      saveCreatorToken('bet-1', 'tok-1');
      saveCreatorToken('bet-1', 'tok-1');
      const myBets = JSON.parse(localStorage.getItem('my_bets') || '[]');
      expect(myBets.filter((id: string) => id === 'bet-1')).toHaveLength(1);
    });
  });

  describe('getShareUrl', () => {
    it('returns clean URL without theme for neo', () => {
      const url = getShareUrl('my-bet');
      expect(url).toBe(`${window.location.origin}/bet/my-bet`);
    });

    it('returns clean URL when no theme specified', () => {
      const url = getShareUrl('my-bet');
      expect(url).not.toContain('theme=');
    });

    it('appends theme parameter for non-neo themes', () => {
      const url = getShareUrl('my-bet', 'retro');
      expect(url).toBe(`${window.location.origin}/bet/my-bet?theme=retro`);
    });

    it('omits theme parameter for neo', () => {
      const url = getShareUrl('my-bet', 'neo');
      expect(url).toBe(`${window.location.origin}/bet/my-bet`);
    });
  });

  describe('isStorageAvailable', () => {
    it('returns true in jsdom (localStorage works)', () => {
      expect(isStorageAvailable()).toBe(true);
    });
  });
});
