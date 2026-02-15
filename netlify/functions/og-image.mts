import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import type { Context } from "@netlify/functions";

// Cache the font so we don't re-fetch on every invocation
let fontData: ArrayBuffer | null = null;

async function loadFont(): Promise<ArrayBuffer> {
  if (fontData) return fontData;
  const res = await fetch(
    "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hjQ.ttf"
  );
  fontData = await res.arrayBuffer();
  return fontData;
}

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

  let question = "Make predictions with friends";
  let typeLabel = "";
  let statsText = "Bragging rights, no real money";

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/bets?code_name=eq.${encodeURIComponent(code)}&select=question,bet_type,total_predictions,creator_name,resolved`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    );

    if (res.ok) {
      const bets = await res.json();
      if (bets && bets.length > 0) {
        const bet = bets[0];
        question = bet.question;
        typeLabel = bet.bet_type === "yesno" ? "YES / NO" : "MULTIPLE CHOICE";
        const status = bet.resolved
          ? "Resolved"
          : `${bet.total_predictions} prediction${bet.total_predictions !== 1 ? "s" : ""}`;
        statsText = `${status}${bet.creator_name ? ` · by ${bet.creator_name}` : ""}`;
      }
    }
  } catch {
    // Use defaults
  }

  const font = await loadFont();

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
          padding: "60px 70px",
          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
          fontFamily: "Inter",
          color: "white",
        },
        children: [
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                    },
                    children: [
                      {
                        type: "div",
                        props: {
                          style: {
                            fontSize: "24px",
                            fontWeight: 700,
                            opacity: 0.9,
                          },
                          children: "Little Bets",
                        },
                      },
                      typeLabel
                        ? {
                            type: "div",
                            props: {
                              style: {
                                fontSize: "14px",
                                fontWeight: 600,
                                background: "rgba(255,255,255,0.2)",
                                padding: "4px 12px",
                                borderRadius: "20px",
                              },
                              children: typeLabel,
                            },
                          }
                        : null,
                    ].filter(Boolean),
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      fontSize: question.length > 60 ? "42px" : "52px",
                      fontWeight: 700,
                      lineHeight: 1.2,
                      maxWidth: "900px",
                    },
                    children: question,
                  },
                },
              ],
            },
          },
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
                    style: {
                      fontSize: "20px",
                      opacity: 0.8,
                    },
                    children: statsText,
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      fontSize: "18px",
                      opacity: 0.6,
                    },
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
          name: "Inter",
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
