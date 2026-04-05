import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import type { Context } from "@netlify/functions";

// Cache the font so we don't re-fetch on every invocation
let fontData: ArrayBuffer | null = null;

async function loadFont(): Promise<ArrayBuffer> {
  if (fontData) return fontData;
  const res = await fetch(
    "https://fonts.gstatic.com/s/spacegrotesk/v16/V8mDoQDjQSkFtoMM3T6r8E7mPbF4Cw.ttf"
  );
  fontData = await res.arrayBuffer();
  return fontData;
}

interface Bet {
  id: string;
  question: string;
  bet_type: string;
  total_predictions: number;
  creator_name: string | null;
  resolved: boolean;
  winning_option_index: number | null;
  options: { text: string }[];
}

interface Participant {
  participant_name: string;
  prediction: boolean | null;
  option_index: number | null;
}

function didWin(bet: Bet, p: Participant): boolean {
  if (!bet.resolved || bet.winning_option_index === null) return false;
  if (bet.bet_type === "yesno") {
    return p.prediction === (bet.winning_option_index === 0);
  }
  return p.option_index === bet.winning_option_index;
}

function getWinLabel(bet: Bet): string {
  if (!bet.resolved || bet.winning_option_index === null) return "";
  if (bet.bet_type === "yesno") {
    return bet.winning_option_index === 0 ? "Yes" : "No";
  }
  return bet.options?.[bet.winning_option_index]?.text ?? "Unknown";
}

function getPredictionLabel(bet: Bet, p: Participant): string {
  if (bet.bet_type === "yesno") {
    return p.prediction ? "Yes" : "No";
  }
  return bet.options?.[p.option_index ?? 0]?.text ?? "";
}

const BG = "#111111";
const WHITE = "#ffffff";
const YELLOW = "#f5f020";
const MUTED = "#aaaaaa";
const SUBTLE = "#888888";

export default async function handler(req: Request, _context: Context) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return new Response("Missing code parameter", { status: 400 });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return new Response("Missing env vars", { status: 500 });
  }

  const headers = {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
  };

  let bet: Bet | null = null;
  let participants: Participant[] = [];
  let photoMap = new Map<string, string>(); // name → base64 data URL

  try {
    // Fetch bet
    const betRes = await fetch(
      `${supabaseUrl}/rest/v1/bets?code_name=eq.${encodeURIComponent(code)}&select=id,question,bet_type,total_predictions,creator_name,resolved,winning_option_index,options`,
      { headers }
    );

    if (betRes.ok) {
      const bets = await betRes.json();
      if (bets?.length > 0) bet = bets[0];
    }

    if (bet) {
      // Fetch participants and photos in parallel
      const [partsRes, photosRes] = await Promise.all([
        fetch(
          `${supabaseUrl}/rest/v1/sealed_bet_participants?bet_id=eq.${bet.id}&select=participant_name,prediction,option_index&order=created_at.desc`,
          { headers }
        ).catch(() => null),
        fetch(
          `${supabaseUrl}/storage/v1/object/list/ptp-photos/${bet.id}`,
          { headers }
        ).catch(() => null),
      ]);

      if (partsRes?.ok) {
        try { participants = await partsRes.json(); } catch { /* ignore */ }
      }

      // Fetch actual photo files
      if (photosRes?.ok) {
        try {
          const files: { name: string }[] = await photosRes.json();
          const photoFetches = files.slice(0, 8).map(async (file) => {
            try {
              const photoRes = await fetch(
                `${supabaseUrl}/storage/v1/object/public/ptp-photos/${bet!.id}/${file.name}`,
              );
              if (photoRes.ok) {
                const buf = await photoRes.arrayBuffer();
                const b64 = Buffer.from(buf).toString("base64");
                const name = decodeURIComponent(file.name.replace(/\.jpg$/, ""));
                photoMap.set(name, `data:image/jpeg;base64,${b64}`);
              }
            } catch { /* skip this photo */ }
          });
          await Promise.all(photoFetches);
        } catch { /* ignore */ }
      }
    }
  } catch {
    // Fall through to text-only card
  }

  const font = await loadFont();

  const question = bet?.question || "Make predictions with friends";
  const isResolved = bet?.resolved === true && bet?.winning_option_index !== null;
  const winLabel = bet ? getWinLabel(bet) : "";

  // Sort: winners first, then losers
  const winners = isResolved ? participants.filter((p) => didWin(bet!, p)) : [];
  const losers = isResolved ? participants.filter((p) => !didWin(bet!, p)) : [];
  const allParticipants = isResolved ? [...winners, ...losers] : [...participants];
  const maxAvatars = Math.min(allParticipants.length, 8);

  // Date
  const dateStr = bet
    ? new Date(bet.resolved ? Date.now() : Date.now()).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
      })
    : "";

  // Stats
  const statsText = isResolved
    ? `${winners.length} called it · ${losers.length} missed · ${participants.length} total`
    : `${participants.length} locked in`;

  // Build avatar elements
  const avatarR = 68;
  const avatarSpacing = 120;
  const avatarElements = allParticipants.slice(0, maxAvatars).map((p, _i) => {
    const isWinner = isResolved && didWin(bet!, p);
    const photoSrc = photoMap.get(p.participant_name);
    const initial = p.participant_name.charAt(0).toUpperCase();
    const displayName = p.participant_name.length > 8
      ? p.participant_name.slice(0, 7) + "..."
      : p.participant_name;

    const avatarContent = photoSrc
      ? {
          type: "img",
          props: {
            src: photoSrc,
            width: avatarR * 2,
            height: avatarR * 2,
            style: {
              borderRadius: "50%",
              objectFit: "cover" as const,
              border: isWinner ? `3px solid ${YELLOW}` : "none",
            },
          },
        }
      : {
          type: "div",
          props: {
            style: {
              width: `${avatarR * 2}px`,
              height: `${avatarR * 2}px`,
              borderRadius: "50%",
              background: isResolved ? (isWinner ? YELLOW : SUBTLE) : SUBTLE,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: `${avatarR}px`,
              fontWeight: 600,
              color: BG,
            },
            children: initial,
          },
        };

    const predLabel = isResolved && p.prediction !== null && p.prediction !== undefined
      ? {
          type: "div",
          props: {
            style: {
              fontSize: "14px",
              fontWeight: 500,
              color: isWinner ? YELLOW : SUBTLE,
              textAlign: "center" as const,
            },
            children: getPredictionLabel(bet!, p),
          },
        }
      : null;

    return {
      type: "div",
      props: {
        style: {
          display: "flex",
          flexDirection: "column" as const,
          alignItems: "center",
          gap: "4px",
          width: `${avatarSpacing}px`,
        },
        children: [
          avatarContent,
          {
            type: "div",
            props: {
              style: {
                fontSize: "15px",
                fontWeight: 500,
                color: isResolved ? (isWinner ? WHITE : SUBTLE) : WHITE,
                textAlign: "center" as const,
              },
              children: displayName,
            },
          },
          predLabel,
        ].filter(Boolean),
      },
    };
  });

  // Overflow indicator
  if (allParticipants.length > maxAvatars) {
    avatarElements.push({
      type: "div",
      props: {
        style: {
          display: "flex",
          flexDirection: "column" as const,
          alignItems: "center",
          gap: "4px",
          width: `${avatarSpacing}px`,
        },
        children: [
          {
            type: "div",
            props: {
              style: {
                width: `${avatarR * 2}px`,
                height: `${avatarR * 2}px`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
                fontWeight: 600,
                color: MUTED,
              },
              children: `+${allParticipants.length - maxAvatars}`,
            },
          },
        ],
      },
    });
  }

  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "40px 60px",
          backgroundColor: BG,
          fontFamily: "Space Grotesk",
          color: WHITE,
        },
        children: [
          // Top section: brand + date
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: { fontSize: "18px", fontWeight: 700, color: YELLOW },
                    children: "Little Bets",
                  },
                },
                dateStr
                  ? {
                      type: "div",
                      props: {
                        style: { fontSize: "16px", color: MUTED },
                        children: dateStr,
                      },
                    }
                  : null,
              ].filter(Boolean),
            },
          },
          // Middle section: question + answer + avatars
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                flex: 1,
                justifyContent: "center",
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: {
                      fontSize: question.length > 80 ? "28px" : "36px",
                      fontWeight: 700,
                      lineHeight: 1.3,
                      color: WHITE,
                    },
                    children: question,
                  },
                },
                isResolved && winLabel
                  ? {
                      type: "div",
                      props: {
                        style: {
                          fontSize: "48px",
                          fontWeight: 800,
                          color: YELLOW,
                          marginTop: "4px",
                        },
                        children: winLabel,
                      },
                    }
                  : null,
                avatarElements.length > 0
                  ? {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          justifyContent: "center",
                          gap: "0px",
                          marginTop: "16px",
                        },
                        children: avatarElements,
                      },
                    }
                  : null,
              ].filter(Boolean),
            },
          },
          // Bottom section: stats + branding
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: { fontSize: "16px", color: MUTED },
                    children: statsText,
                  },
                },
                {
                  type: "div",
                  props: {
                    style: { fontSize: "14px", color: SUBTLE },
                    children: "littlebets.netlify.app",
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Space Grotesk",
          data: font,
          weight: 700,
          style: "normal",
        },
      ],
    }
  );

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: 1200 },
  });
  const png = resvg.render().asPng();

  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
