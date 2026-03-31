import { useRef, useEffect, useState } from 'react';
import { track } from '../lib/analytics';
import { loadImage } from '../lib/image-utils';
import { getWinningLabel, didParticipantWin } from '../lib/bet-utils';
import type { Bet, BetParticipant } from '../types';
import '../styles/MomentCard.css';

interface Props {
  bet: Bet;
  participants: BetParticipant[];
  photos: Map<string, string>;
}

const W = 1200;
const H = 630;
const BG = '#111111';
const WHITE = '#ffffff';
const YELLOW = '#f5f020';
const MUTED = '#aaaaaa';
const SUBTLE = '#666666';
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
  isWinner: boolean
) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = isWinner ? YELLOW : SUBTLE;
  ctx.fill();

  ctx.font = `600 ${r}px ${FONT}`;
  ctx.fillStyle = BG;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(name.charAt(0).toUpperCase(), cx, cy + 2);
}

function MomentCard({ bet, participants, photos }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rendered, setRendered] = useState(false);
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  useEffect(() => {
    renderCard();
  }, [bet.id]);

  async function renderCard() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

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

    // Winning answer
    const winLabel = getWinningLabel(bet);
    if (winLabel) {
      cursorY += 12;
      ctx.font = `800 48px ${FONT}`;
      ctx.fillStyle = YELLOW;
      ctx.fillText(winLabel, 60, cursorY);
      cursorY += 60;
    }

    // Participants section
    const winners = participants.filter(p => didParticipantWin(bet, p));
    const losers = participants.filter(p => !didParticipantWin(bet, p));
    const allParticipants = [...winners, ...losers];

    // Avatar circles
    const avatarR = 44;
    const avatarSpacing = 104;
    const maxAvatars = Math.min(allParticipants.length, 8);
    const avatarY = Math.max(cursorY + 24, 300);
    const avatarStartX = 60;

    // Load all photos
    const photoImages = new Map<string, HTMLImageElement>();
    const loadPromises = allParticipants.slice(0, maxAvatars).map(async p => {
      const src = photos.get(p.participant_name);
      if (src) {
        const img = await loadImage(src);
        if (img) photoImages.set(p.participant_name, img);
      }
    });
    await Promise.all(loadPromises);

    // Draw avatars
    for (let i = 0; i < maxAvatars; i++) {
      const p = allParticipants[i];
      const cx = avatarStartX + i * avatarSpacing + avatarR;
      const cy = avatarY + avatarR;
      const isWinner = didParticipantWin(bet, p);

      const photoImg = photoImages.get(p.participant_name);
      if (photoImg) {
        // Circular photo clip
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, avatarR, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(photoImg, cx - avatarR, cy - avatarR, avatarR * 2, avatarR * 2);
        ctx.restore();

        // Winner ring
        if (isWinner) {
          ctx.beginPath();
          ctx.arc(cx, cy, avatarR + 3, 0, Math.PI * 2);
          ctx.strokeStyle = YELLOW;
          ctx.lineWidth = 3;
          ctx.stroke();
        }
      } else {
        drawInitial(ctx, p.participant_name, cx, cy, avatarR, isWinner);
      }

      // Name label
      ctx.font = `500 15px ${FONT}`;
      ctx.fillStyle = isWinner ? WHITE : MUTED;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const displayName = p.participant_name.length > 8
        ? p.participant_name.slice(0, 7) + '...'
        : p.participant_name;
      ctx.fillText(displayName, cx, cy + avatarR + 8);
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
    const statsText = `${winners.length} called it · ${losers.length} missed · ${participants.length} total`;
    ctx.fillText(statsText, 60, H - 40);

    // Branding bottom right
    ctx.textAlign = 'right';
    ctx.fillStyle = SUBTLE;
    ctx.font = `400 14px ${FONT}`;
    ctx.fillText('littlebets.netlify.app', W - 60, H - 40);

    setRendered(true);
    setImgSrc(canvas.toDataURL('image/png'));
  }

  async function handleShare() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    track('moment_card_shared', { bet_id: bet.id });

    // Try sharing as file first
    try {
      const blob = await new Promise<Blob | null>(resolve =>
        canvas.toBlob(resolve, 'image/png')
      );
      if (blob && navigator.share) {
        const file = new File([blob], 'little-bets-moment.png', { type: 'image/png' });
        await navigator.share({
          files: [file],
          title: bet.question,
        });
        return;
      }
    } catch {
      // Share cancelled or unsupported, fall through
    }

    // Fallback: download
    try {
      const link = document.createElement('a');
      link.download = 'little-bets-moment.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      // Nothing we can do
    }
  }

  return (
    <div className="moment-card-section">
      <h3 className="moment-card-title">Share the Moment</h3>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className="moment-card-canvas"
      />
      {imgSrc && (
        <img
          src={imgSrc}
          alt="Moment card"
          className="moment-card-preview"
        />
      )}
      {rendered && (
        <button className="moment-card-share-btn" onClick={handleShare}>
          Share Card
        </button>
      )}
    </div>
  );
}

export default MomentCard;
