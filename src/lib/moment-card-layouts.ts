export interface Slot {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface LayoutConfig {
  winner: Slot;
  gridArea: { x: number; y: number; w: number; h: number };
  gridCols: number;
  maxVisible: number;
}

const LAYOUTS: { minCount: number; config: LayoutConfig }[] = [
  {
    minCount: 2,
    config: {
      winner: { x: 0, y: 0, w: 0.5, h: 1 },
      gridArea: { x: 0.5, y: 0, w: 0.5, h: 1 },
      gridCols: 1,
      maxVisible: 2,
    },
  },
  {
    minCount: 3,
    config: {
      winner: { x: 0, y: 0, w: 0.6, h: 1 },
      gridArea: { x: 0.6, y: 0, w: 0.4, h: 1 },
      gridCols: 1,
      maxVisible: 3,
    },
  },
  {
    minCount: 4,
    config: {
      winner: { x: 0, y: 0, w: 0.5, h: 1 },
      gridArea: { x: 0.5, y: 0, w: 0.5, h: 1 },
      gridCols: 2,
      maxVisible: 6,
    },
  },
  {
    minCount: 7,
    config: {
      winner: { x: 0, y: 0, w: 0.4, h: 1 },
      gridArea: { x: 0.4, y: 0, w: 0.6, h: 1 },
      gridCols: 3,
      maxVisible: 12,
    },
  },
];

export function getLayout(count: number): LayoutConfig | null {
  if (count <= 1) return null;
  if (count >= 13) return null;
  let layout = LAYOUTS[0].config;
  for (const entry of LAYOUTS) {
    if (count >= entry.minCount) layout = entry.config;
  }
  return layout;
}

export function computeSlots(
  count: number,
  canvasW: number,
  _canvasH: number,
  collageY: number,
  collageH: number,
): Slot[] {
  if (count === 0) return [];

  // Single participant: full bleed
  if (count === 1) {
    return [{ x: 0, y: collageY, w: canvasW, h: collageH }];
  }

  // 13-20: dense grid, winner spans 2x2 in top-left
  if (count >= 13) {
    return computeDenseGrid(count, canvasW, collageY, collageH);
  }

  // 2-12: winner left, grid right
  const layout = getLayout(count)!;
  const slots: Slot[] = [];

  slots.push({
    x: layout.winner.x * canvasW,
    y: collageY + layout.winner.y * collageH,
    w: layout.winner.w * canvasW,
    h: layout.winner.h * collageH,
  });

  const remaining = Math.min(count - 1, layout.maxVisible - 1);
  const { gridCols } = layout;
  const gridRows = Math.ceil(remaining / gridCols);

  const gx = layout.gridArea.x * canvasW;
  const gy = collageY + layout.gridArea.y * collageH;
  const gw = layout.gridArea.w * canvasW;
  const gh = layout.gridArea.h * collageH;
  const cellW = gw / gridCols;
  const cellH = gh / gridRows;

  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
      if (slots.length > remaining) break;
      slots.push({
        x: gx + col * cellW,
        y: gy + row * cellH,
        w: cellW,
        h: cellH,
      });
    }
  }

  return slots;
}

function computeDenseGrid(
  count: number,
  canvasW: number,
  collageY: number,
  collageH: number,
): Slot[] {
  const cols = 5;
  const visible = Math.min(count, 20);
  // +2 accounts for winner spanning 2x2 (takes 4 cells, displaces 3 extra)
  const totalCells = visible + 3;
  const rows = Math.ceil(totalCells / cols);
  const cellW = canvasW / cols;
  const cellH = collageH / rows;

  const slots: Slot[] = [];

  // Winner: 2x2 top-left
  slots.push({
    x: 0,
    y: collageY,
    w: cellW * 2,
    h: cellH * 2,
  });

  // Fill remaining cells, skipping the winner's 2x2 area
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (row < 2 && col < 2) continue;
      if (slots.length >= visible) break;
      slots.push({
        x: col * cellW,
        y: collageY + row * cellH,
        w: cellW,
        h: cellH,
      });
    }
    if (slots.length >= visible) break;
  }

  return slots;
}
