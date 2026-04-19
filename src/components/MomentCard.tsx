import { useRef, useEffect, useState, useCallback } from 'react';
import { track } from '../lib/analytics';
import { loadImage } from '../lib/image-utils';
import { getWinningLabel, didParticipantWin } from '../lib/bet-utils';
import { getShareUrl } from '../lib/creator-token';
import { uploadOgImage, uploadStakesOgImage } from '../lib/supabase';
import { computeSlots } from '../lib/moment-card-layouts';
import WTPModal, { incrementShareCount } from './WTPModal';
import { useToast } from '../context/ToastContext';
import type { Bet, BetParticipant } from '../types';
import '../styles/MomentCard.css';

interface Props {
  bet: Bet;
  participants: BetParticipant[];
  photos: Map<string, string>;
  codeName: string;
  photosLoading?: boolean;
  variant?: 'result' | 'stakes';
}

const WIDE_W = 1200;
const WIDE_H = 630;
const SQ_W = 1200;
const SQ_H = 1200;
const BG = '#111111';
const WHITE = '#ffffff';
const YELLOW = '#f5f020';
const MUTED = '#aaaaaa';
const SUBTLE = '#888888';
const FONT = '"Space Grotesk", "Helvetica Neue", Arial, sans-serif';

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number
): number {
  const words = text.split(' ');
  let line = '';
  let linesDrawn = 0;

  for (let i = 0; i < words.length; i++) {
    const test = line + (line ? ' ' : '') + words[i];
    if (ctx.measureText(test).width > maxWidth && line) {
      linesDrawn++;
      if (linesDrawn >= maxLines) {
        ctx.fillText(line + '...', x, y);
        return y + lineHeight;
      }
      ctx.fillText(line, x, y);
      y += lineHeight;
      line = words[i];
    } else {
      line = test;
    }
  }
  if (line) {
    ctx.fillText(line, x, y);
    y += lineHeight;
  }
  return y;
}

function drawPredictionBadge(
  ctx: CanvasRenderingContext2D,
  label: string,
  sx: number,
  sy: number,
  sw: number,
  sh: number,
) {
  const fontSize = 14;
  ctx.font = `600 ${fontSize}px ${FONT}`;
  const textWidth = ctx.measureText(label).width;
  const padX = 6;
  const padY = 4;
  const bw = textWidth + padX * 2;
  const bh = fontSize + padY * 2;
  const bx = sx + sw - bw - 6;
  const by = sy + sh - bh - 6;

  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 4);
  ctx.fill();

  ctx.fillStyle = WHITE;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(label, bx + padX, by + padY);
}

function drawPhotoSlot(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | null,
  name: string,
  x: number,
  y: number,
  w: number,
  h: number,
  isWinner: boolean,
  resolved: boolean,
  gap: number,
  predictionLabel?: string,
) {
  const inset = gap / 2;
  const sx = x + inset;
  const sy = y + inset;
  const sw = w - gap;
  const sh = h - gap;

  ctx.save();
  ctx.beginPath();
  ctx.rect(sx, sy, sw, sh);
  ctx.clip();

  if (img) {
    const scale = Math.max(sw / img.width, sh / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    ctx.drawImage(img, sx + (sw - dw) / 2, sy + (sh - dh) / 2, dw, dh);
  } else {
    ctx.fillStyle = resolved ? (isWinner ? '#2a2800' : '#222') : '#222';
    ctx.fillRect(sx, sy, sw, sh);
    const initial = name.charAt(0).toUpperCase();
    const fontSize = Math.min(sw, sh) * 0.4;
    ctx.font = `600 ${fontSize}px ${FONT}`;
    ctx.fillStyle = resolved ? (isWinner ? YELLOW : SUBTLE) : SUBTLE;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initial, sx + sw / 2, sy + sh / 2);
  }

  // Name label bottom-left
  const labelSize = Math.max(12, Math.min(16, sw * 0.08));
  ctx.font = `600 ${labelSize}px ${FONT}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = 4;
  ctx.fillStyle = WHITE;
  const displayName = name.length > 10 ? name.slice(0, 9) + '...' : name;
  ctx.fillText(displayName, sx + 8, sy + sh - 8);
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';

  if (predictionLabel) {
    drawPredictionBadge(ctx, predictionLabel, sx, sy, sw, sh);
  }

  ctx.restore();

  // Winner ring
  if (isWinner && resolved) {
    ctx.strokeStyle = YELLOW;
    ctx.lineWidth = 3;
    ctx.strokeRect(sx, sy, sw, sh);
  }
}

function drawOverflowSlot(
  ctx: CanvasRenderingContext2D,
  overflow: number,
  x: number,
  y: number,
  w: number,
  h: number,
  gap: number,
) {
  const inset = gap / 2;
  const sx = x + inset;
  const sy = y + inset;
  const sw = w - gap;
  const sh = h - gap;

  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(sx, sy, sw, sh);

  const fontSize = Math.min(sw, sh) * 0.3;
  ctx.font = `600 ${fontSize}px ${FONT}`;
  ctx.fillStyle = MUTED;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`+${overflow}`, sx + sw / 2, sy + sh / 2);
}

async function renderToCanvas(
  canvas: HTMLCanvasElement,
  bet: Bet,
  participants: BetParticipant[],
  photos: Map<string, string>,
  variant: 'wide' | 'square',
  isStakes: boolean = false,
): Promise<string> {
  const W = variant === 'wide' ? WIDE_W : SQ_W;
  const H = variant === 'wide' ? WIDE_H : SQ_H;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const resolved = bet.resolved;
  const PAD = 48;
  const GAP = 4;

  // Background
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);

  // Collage area
  const collageY = variant === 'wide' ? 0 : 0;
  const collageH = variant === 'wide' ? H : H;

  const winners = resolved ? participants.filter(p => didParticipantWin(bet, p)) : [];
  const losers = resolved ? participants.filter(p => !didParticipantWin(bet, p)) : [];
  const allParticipants = resolved ? [...winners, ...losers] : [...participants];
  const count = allParticipants.length;

  // Load photos
  const photoImages = new Map<string, HTMLImageElement>();
  const maxVisible = Math.min(count, 19);
  await Promise.all(
    allParticipants.slice(0, maxVisible).map(async p => {
      const src = photos.get(p.participant_name);
      if (src) {
        try {
          const img = await loadImage(src);
          if (img) photoImages.set(p.participant_name, img);
        } catch { /* fallback to initials */ }
      }
    })
  );

  // Draw photo collage
  if (count > 0) {
    const slots = computeSlots(count, W, H, collageY, collageH);
    const overflow = count > 19 ? count - 19 : 0;

    for (let i = 0; i < Math.min(slots.length, maxVisible); i++) {
      const p = allParticipants[i];
      const slot = slots[i];
      const isWinner = resolved && didParticipantWin(bet, p);
      const img = photoImages.get(p.participant_name) || null;
      let predLabel: string | undefined;
      if (isStakes) {
        if (bet.bet_type === 'yesno') {
          predLabel = p.prediction ? 'Yes' : 'No';
        } else if (p.option_index != null) {
          predLabel = bet.options[p.option_index]?.text;
        }
      }
      drawPhotoSlot(ctx, img, p.participant_name, slot.x, slot.y, slot.w, slot.h, isWinner, resolved, GAP, predLabel);
    }

    if (overflow > 0 && slots.length > maxVisible) {
      const lastSlot = slots[slots.length - 1];
      drawOverflowSlot(ctx, overflow + 1, lastSlot.x, lastSlot.y, lastSlot.w, lastSlot.h, GAP);
    }
  }

  // Gradient overlays for text legibility
  const topGrad = ctx.createLinearGradient(0, 0, 0, variant === 'wide' ? 200 : 280);
  topGrad.addColorStop(0, 'rgba(17,17,17,0.92)');
  topGrad.addColorStop(1, 'rgba(17,17,17,0)');
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, W, variant === 'wide' ? 200 : 280);

  const botGrad = ctx.createLinearGradient(0, H - (variant === 'wide' ? 160 : 220), 0, H);
  botGrad.addColorStop(0, 'rgba(17,17,17,0)');
  botGrad.addColorStop(1, 'rgba(17,17,17,0.92)');
  ctx.fillStyle = botGrad;
  ctx.fillRect(0, H - (variant === 'wide' ? 160 : 220), W, variant === 'wide' ? 160 : 220);

  // Branding top-left
  ctx.font = `700 18px ${FONT}`;
  ctx.fillStyle = YELLOW;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('Little Bets', PAD, PAD - 8);

  // Date top-right
  const dateStr = new Date(bet.resolved_at || bet.created_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
  ctx.font = `400 16px ${FONT}`;
  ctx.fillStyle = MUTED;
  ctx.textAlign = 'right';
  ctx.fillText(dateStr, W - PAD, PAD - 4);

  // Question
  ctx.textAlign = 'left';
  const qFontSize = variant === 'wide' ? 32 : 40;
  ctx.font = `700 ${qFontSize}px ${FONT}`;
  ctx.fillStyle = WHITE;
  const qY = variant === 'wide' ? PAD + 36 : PAD + 40;
  wrapText(ctx, bet.question, PAD, qY, W - PAD * 2, qFontSize * 1.25, 2);

  // Result + stats at bottom
  if (resolved) {
    const winLabel = getWinningLabel(bet);
    if (winLabel) {
      const resultFontSize = variant === 'wide' ? 44 : 56;
      ctx.font = `800 ${resultFontSize}px ${FONT}`;
      ctx.fillStyle = YELLOW;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(winLabel, PAD, H - PAD - 30);
    }
  }

  // Stats line
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  ctx.font = `400 14px ${FONT}`;
  ctx.fillStyle = MUTED;
  const statsText = resolved
    ? `${winners.length} called it · ${losers.length} missed · ${participants.length} total`
    : `${participants.length} locked in`;
  ctx.fillText(statsText, PAD, H - PAD);

  // Watermark bottom-right
  ctx.textAlign = 'right';
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = WHITE;
  ctx.font = `400 14px ${FONT}`;
  ctx.fillText('littlebets.netlify.app', W - PAD, H - PAD);
  ctx.globalAlpha = 1;

  if (isStakes) {
    ctx.fillStyle = 'rgba(245, 240, 32, 0.08)';
    ctx.fillRect(0, 0, W, H);
  }

  return canvas.toDataURL('image/png');
}

function MomentCard({ bet, participants, photos, codeName, photosLoading, variant = 'result' }: Props) {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [showLongPressHint, setShowLongPressHint] = useState(false);
  const [showWTP, setShowWTP] = useState(false);
  const isStakes = variant === 'stakes';

  useEffect(() => {
    if (!photosLoading) renderCard();
  }, [bet.id, bet.winning_option_index, participants, photos, photosLoading, variant]);

  async function renderCard() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = await renderToCanvas(canvas, bet, participants, photos, 'wide', isStakes);
    setImgSrc(dataUrl);

    if (isStakes) {
      canvas.toBlob((blob) => {
        if (blob) uploadStakesOgImage(codeName, blob).catch(() => {});
      }, 'image/png');
    } else if (bet.resolved) {
      canvas.toBlob((blob) => {
        if (blob) uploadOgImage(codeName, blob).catch(() => {});
      }, 'image/png');
    }
  }

  const shareOrDownload = useCallback(async (sizeVariant: 'wide' | 'square', trackEvent: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (sizeVariant === 'square') {
      await renderToCanvas(canvas, bet, participants, photos, 'square', isStakes);
    }

    track(trackEvent, { bet_id: bet.id, variant: sizeVariant, card_type: isStakes ? 'stakes' : 'result' });

    const blob = await new Promise<Blob | null>(resolve =>
      canvas.toBlob(resolve, 'image/png')
    );

    if (sizeVariant === 'square') {
      renderToCanvas(canvas, bet, participants, photos, 'wide', isStakes).then(setImgSrc);
    }

    if (!blob) return;

    const filename = sizeVariant === 'square'
      ? 'little-bets-moment-square.png'
      : 'little-bets-moment.png';
    const file = new File([blob], filename, { type: 'image/png' });

    // Native share (mobile)
    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: bet.question });
        return;
      }
    } catch { /* cancelled or failed */ }

    // Download fallback
    try {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = filename;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      if (sizeVariant === 'square') {
        track('moment_card_downloaded', { bet_id: bet.id, variant: sizeVariant });
      }
      return;
    } catch { /* fall through */ }

    // Copy link fallback
    try {
      const betUrl = getShareUrl(codeName);
      await navigator.clipboard.writeText(betUrl);
      toast('Link copied to clipboard!');
      track('moment_card_copy_link', { bet_id: bet.id });
    } catch { /* nothing more */ }
  }, [bet, participants, photos, codeName, toast, isStakes]);

  async function handleShare() {
    const event = isStakes ? 'moment_card_stakes_shared' : 'moment_card_result_shared';
    await shareOrDownload('wide', event);
    setShowLongPressHint(true);
    if (incrementShareCount()) {
      setShowWTP(true);
    }
  }

  async function handleSaveForInstagram() {
    await shareOrDownload('square', 'moment_card_downloaded');
  }

  const altText = bet.resolved
    ? `Moment card: ${bet.question}. ${getWinningLabel(bet) || 'Resolved'}. ${participants.filter(p => didParticipantWin(bet, p)).map(p => p.participant_name).join(', ')} got it right.`
    : `Moment card: ${bet.question}. ${participants.length} locked in.`;

  return (
    <div className="moment-card-section">
      <h3 className="moment-card-title">{isStakes ? 'The Stakes' : 'Share the Moment'}</h3>
      <canvas ref={canvasRef} width={WIDE_W} height={WIDE_H} className="moment-card-canvas" />
      {photosLoading && (
        <div className="moment-card-skeleton">
          <div className="skeleton-circle" />
          <div className="skeleton-circle" />
          <div className="skeleton-circle" />
        </div>
      )}
      {imgSrc && !photosLoading && (
        <img src={imgSrc} alt={altText} className="moment-card-preview" />
      )}
      {showLongPressHint && (
        <p className="moment-card-hint">Long press the image to save it</p>
      )}
      {imgSrc && !photosLoading && (
        <div className="moment-card-actions">
          <button className="moment-card-share-btn" onClick={handleShare}>
            {isStakes ? 'Share the stakes' : 'Share'}
          </button>
          <button className="moment-card-instagram-btn" onClick={handleSaveForInstagram}>
            Save for Instagram
          </button>
        </div>
      )}
      <WTPModal open={showWTP} onClose={() => setShowWTP(false)} />
    </div>
  );
}

export default MomentCard;
