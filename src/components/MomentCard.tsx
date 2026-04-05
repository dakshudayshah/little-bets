import { useRef, useEffect, useState } from 'react';
import { track } from '../lib/analytics';
import { loadImage } from '../lib/image-utils';
import { getWinningLabel, didParticipantWin, getParticipantLabel } from '../lib/bet-utils';
import { getShareUrl } from '../lib/creator-token';
import { useToast } from '../context/ToastContext';
import type { Bet, BetParticipant } from '../types';
import '../styles/MomentCard.css';

interface Props {
  bet: Bet;
  participants: BetParticipant[];
  photos: Map<string, string>;
  codeName: string;
  photosLoading?: boolean;
}

const W = 1200;
const H = 630;
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

function drawInitial(
  ctx: CanvasRenderingContext2D,
  name: string,
  cx: number,
  cy: number,
  r: number,
  isWinner: boolean,
  resolved: boolean
) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = resolved ? (isWinner ? YELLOW : SUBTLE) : SUBTLE;
  ctx.fill();

  ctx.font = `600 ${r}px ${FONT}`;
  ctx.fillStyle = BG;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(name.charAt(0).toUpperCase(), cx, cy + 2);
}

function drawCheckmark(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  const badgeR = 12;
  const bx = cx + r * 0.7;
  const by = cy + r * 0.7;

  // Yellow circle badge
  ctx.beginPath();
  ctx.arc(bx, by, badgeR, 0, Math.PI * 2);
  ctx.fillStyle = YELLOW;
  ctx.fill();

  // White checkmark
  ctx.beginPath();
  ctx.moveTo(bx - 5, by);
  ctx.lineTo(bx - 1, by + 4);
  ctx.lineTo(bx + 6, by - 4);
  ctx.strokeStyle = BG;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
}

function MomentCard({ bet, participants, photos, codeName, photosLoading }: Props) {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [showLongPressHint, setShowLongPressHint] = useState(false);

  useEffect(() => {
    if (!photosLoading) renderCard();
  }, [bet.id, bet.winning_option_index, participants, photos, photosLoading]);

  async function renderCard() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resolved = bet.resolved;

    // Background
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);

    // Branding
    ctx.font = `700 18px ${FONT}`;
    ctx.fillStyle = YELLOW;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('Little Bets', 60, 40);

    // Date
    const dateStr = new Date(bet.resolved_at || bet.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    ctx.font = `400 16px ${FONT}`;
    ctx.fillStyle = MUTED;
    ctx.textAlign = 'right';
    ctx.fillText(dateStr, W - 60, 44);

    // Question
    ctx.textAlign = 'left';
    ctx.font = `700 36px ${FONT}`;
    ctx.fillStyle = WHITE;
    let cursorY = wrapText(ctx, bet.question, 60, 100, W - 120, 44, 2);

    // Winning answer (only when resolved)
    if (resolved) {
      const winLabel = getWinningLabel(bet);
      if (winLabel) {
        cursorY += 12;
        ctx.font = `800 48px ${FONT}`;
        ctx.fillStyle = YELLOW;
        ctx.fillText(winLabel, 60, cursorY);
        cursorY += 60;
      }
    }

    // Participants section
    const winners = resolved ? participants.filter(p => didParticipantWin(bet, p)) : [];
    const losers = resolved ? participants.filter(p => !didParticipantWin(bet, p)) : [];
    const allParticipants = resolved ? [...winners, ...losers] : [...participants];

    // Avatar layout
    const avatarR = 68;
    const avatarSpacing = 120;
    const maxAvatars = Math.min(allParticipants.length, 8);
    const avatarY = Math.max(cursorY + 24, 280);
    // Center avatars horizontally
    const totalAvatarWidth = maxAvatars * avatarSpacing;
    const avatarStartX = (W - totalAvatarWidth) / 2 + avatarSpacing / 2 - avatarR;

    // Load all photos
    const photoImages = new Map<string, HTMLImageElement>();
    const loadPromises = allParticipants.slice(0, maxAvatars).map(async p => {
      const src = photos.get(p.participant_name);
      if (src) {
        try {
          const img = await loadImage(src);
          if (img) photoImages.set(p.participant_name, img);
        } catch {
          // Silent fallback to initials
        }
      }
    });
    await Promise.all(loadPromises);

    // Draw avatars
    for (let i = 0; i < maxAvatars; i++) {
      const p = allParticipants[i];
      const cx = avatarStartX + i * avatarSpacing + avatarR;
      const cy = avatarY + avatarR;
      const isWinner = resolved && didParticipantWin(bet, p);

      const photoImg = photoImages.get(p.participant_name);
      if (photoImg) {
        // Circular photo clip
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, avatarR, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(photoImg, cx - avatarR, cy - avatarR, avatarR * 2, avatarR * 2);
        ctx.restore();

        // Winner ring: solid 3px yellow stroke
        if (isWinner) {
          ctx.beginPath();
          ctx.arc(cx, cy, avatarR + 3, 0, Math.PI * 2);
          ctx.strokeStyle = YELLOW;
          ctx.lineWidth = 3;
          ctx.stroke();
        }
      } else {
        drawInitial(ctx, p.participant_name, cx, cy, avatarR, isWinner, resolved);
      }

      // Winner checkmark badge
      if (isWinner) {
        drawCheckmark(ctx, cx, cy, avatarR);
      }

      // Name label
      ctx.font = `500 15px ${FONT}`;
      ctx.fillStyle = resolved ? (isWinner ? WHITE : SUBTLE) : WHITE;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const displayName = p.participant_name.length > 8
        ? p.participant_name.slice(0, 7) + '...'
        : p.participant_name;
      ctx.fillText(displayName, cx, cy + avatarR + 8);

      // Prediction label (only when resolved and predictions are visible)
      if (resolved && p.prediction !== null && p.prediction !== undefined) {
        ctx.font = `500 14px ${FONT}`;
        ctx.fillStyle = isWinner ? YELLOW : SUBTLE;
        const label = getParticipantLabel(bet, p);
        ctx.fillText(label, cx, cy + avatarR + 26);
      }
    }

    if (allParticipants.length > maxAvatars) {
      const cx = avatarStartX + maxAvatars * avatarSpacing + avatarR;
      const cy = avatarY + avatarR;
      ctx.font = `600 16px ${FONT}`;
      ctx.fillStyle = MUTED;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`+${allParticipants.length - maxAvatars}`, cx, cy);
    }

    // Stats line at bottom
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.font = `400 16px ${FONT}`;
    ctx.fillStyle = MUTED;
    const statsText = resolved
      ? `${winners.length} called it · ${losers.length} missed · ${participants.length} total`
      : `${participants.length} locked in`;
    ctx.fillText(statsText, 60, H - 40);

    // Branding bottom right
    ctx.textAlign = 'right';
    ctx.fillStyle = SUBTLE;
    ctx.font = `400 14px ${FONT}`;
    ctx.fillText('littlebets.netlify.app', W - 60, H - 40);

    setImgSrc(canvas.toDataURL('image/png'));
  }

  async function handleShare() {
    const canvas = canvasRef.current;
    if (!canvas || !imgSrc) return;

    track('moment_card_shared', { bet_id: bet.id });

    // Step 1: native file share (mobile, supports files)
    try {
      const blob = await new Promise<Blob | null>(resolve =>
        canvas.toBlob(resolve, 'image/png')
      );
      if (blob) {
        const file = new File([blob], 'little-bets-moment.png', { type: 'image/png' });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: bet.question });
          return;
        }
      }
    } catch {
      // Share cancelled or failed, fall through
    }

    // Step 2: show long press hint for mobile image save
    setShowLongPressHint(true);

    // Step 3: try programmatic download (desktop)
    try {
      const link = document.createElement('a');
      link.download = 'little-bets-moment.png';
      link.href = imgSrc;
      link.click();
      return;
    } catch {
      // fall through
    }

    // Step 4: copy bet URL to clipboard
    try {
      const betUrl = getShareUrl(codeName);
      await navigator.clipboard.writeText(betUrl);
      toast('Link copied to clipboard!');
    } catch {
      // nothing more to do
    }
  }

  // Dynamic alt text
  const altText = bet.resolved
    ? `Moment card: ${bet.question}. ${getWinningLabel(bet) || 'Resolved'}. ${participants.filter(p => didParticipantWin(bet, p)).map(p => p.participant_name).join(', ')} got it right.`
    : `Moment card: ${bet.question}. ${participants.length} locked in.`;

  return (
    <div className="moment-card-section">
      <h3 className="moment-card-title">Share the Moment</h3>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className="moment-card-canvas"
      />
      {photosLoading && (
        <div className="moment-card-skeleton">
          <div className="skeleton-circle" />
          <div className="skeleton-circle" />
          <div className="skeleton-circle" />
        </div>
      )}
      {imgSrc && !photosLoading && (
        <img
          src={imgSrc}
          alt={altText}
          className="moment-card-preview"
        />
      )}
      {showLongPressHint && (
        <p className="moment-card-hint">Long press the image to save it</p>
      )}
      {imgSrc && !photosLoading && (
        <button className="moment-card-share-btn" onClick={handleShare}>
          Share Card
        </button>
      )}
    </div>
  );
}

export default MomentCard;
