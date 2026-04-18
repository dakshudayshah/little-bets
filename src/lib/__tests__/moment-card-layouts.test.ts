import { describe, it, expect } from 'vitest';
import { computeSlots, getLayout } from '../moment-card-layouts';

const W = 1200;
const H = 630;

describe('moment-card-layouts', () => {
  describe('getLayout', () => {
    it('returns null for count <= 1', () => {
      expect(getLayout(0)).toBeNull();
      expect(getLayout(1)).toBeNull();
    });

    it('returns null for count >= 13 (dense grid)', () => {
      expect(getLayout(13)).toBeNull();
      expect(getLayout(20)).toBeNull();
    });

    it('returns correct layout for each bucket', () => {
      expect(getLayout(2)!.gridCols).toBe(1);
      expect(getLayout(3)!.gridCols).toBe(1);
      expect(getLayout(4)!.gridCols).toBe(2);
      expect(getLayout(6)!.gridCols).toBe(2);
      expect(getLayout(7)!.gridCols).toBe(3);
      expect(getLayout(12)!.gridCols).toBe(3);
    });
  });

  describe('computeSlots', () => {
    it('returns empty for count=0', () => {
      expect(computeSlots(0, W, H, 0, H)).toEqual([]);
    });

    it('returns single full-bleed slot for count=1', () => {
      const slots = computeSlots(1, W, H, 0, H);
      expect(slots).toHaveLength(1);
      expect(slots[0]).toEqual({ x: 0, y: 0, w: W, h: H });
    });

    it('count=2: side-by-side 50/50', () => {
      const slots = computeSlots(2, W, H, 0, H);
      expect(slots).toHaveLength(2);
      expect(slots[0].w).toBe(W * 0.5);
      expect(slots[1].w).toBe(W * 0.5);
      expect(slots[0].h).toBe(H);
      expect(slots[1].h).toBe(H);
    });

    it('count=3: winner 60% left, two stacked right', () => {
      const slots = computeSlots(3, W, H, 0, H);
      expect(slots).toHaveLength(3);
      expect(slots[0].w).toBe(W * 0.6);
      expect(slots[1].h).toBeCloseTo(H / 2);
      expect(slots[2].h).toBeCloseTo(H / 2);
    });

    it('count=5: winner left, 4 in 2x2 grid right', () => {
      const slots = computeSlots(5, W, H, 0, H);
      expect(slots).toHaveLength(5);
      expect(slots[0].w).toBe(W * 0.5);
      expect(slots[0].h).toBe(H);
    });

    it('count=10: winner left 40%, 9 in 3-col grid', () => {
      const slots = computeSlots(10, W, H, 0, H);
      expect(slots).toHaveLength(10);
      expect(slots[0].w).toBe(W * 0.4);
    });

    it('count=20: dense grid, winner 2x2 top-left, 19 others', () => {
      const slots = computeSlots(20, W, H, 0, H);
      expect(slots).toHaveLength(20);
      // Winner is 2x2
      const cellW = W / 5;
      expect(slots[0].w).toBeCloseTo(cellW * 2);
    });

    it('count=21: caps at 20 visible slots', () => {
      const slots = computeSlots(21, W, H, 0, H);
      expect(slots).toHaveLength(20);
    });

    it('winner gets largest slot in all layouts', () => {
      for (const count of [2, 3, 5, 10, 15, 20]) {
        const slots = computeSlots(count, W, H, 0, H);
        const winnerArea = slots[0].w * slots[0].h;
        for (let i = 1; i < slots.length; i++) {
          const area = slots[i].w * slots[i].h;
          expect(winnerArea).toBeGreaterThanOrEqual(area);
        }
      }
    });

    it('all slots have positive dimensions', () => {
      for (const count of [1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 13, 15, 19, 20]) {
        const slots = computeSlots(count, W, H, 0, H);
        for (const slot of slots) {
          expect(slot.w).toBeGreaterThan(0);
          expect(slot.h).toBeGreaterThan(0);
        }
      }
    });

    it('respects collageY offset', () => {
      const offset = 100;
      const slots = computeSlots(3, W, H, offset, H - offset);
      expect(slots[0].y).toBe(offset);
    });

    // Square variant
    it('works with square dimensions', () => {
      const SQ = 1200;
      const slots = computeSlots(5, SQ, SQ, 0, SQ);
      expect(slots).toHaveLength(5);
      expect(slots[0].w).toBe(SQ * 0.5);
      expect(slots[0].h).toBe(SQ);
    });
  });
});
