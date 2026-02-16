import type { Context } from "https://edge.netlify.com";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export default async function handler(request: Request, context: Context) {
  const url = new URL(request.url);
  const codeName = url.pathname.replace("/bet/", "");

  if (!codeName) {
    return context.next();
  }

  const supabaseUrl = Netlify.env.get("VITE_SUPABASE_URL");
  const supabaseKey = Netlify.env.get("VITE_SUPABASE_ANON_KEY");

  if (!supabaseUrl || !supabaseKey) {
    return context.next();
  }

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/bets?code_name=eq.${encodeURIComponent(codeName)}&select=question,bet_type,total_predictions,creator_name,resolved,winning_option_index,options`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!res.ok) {
      return context.next();
    }

    const bets = await res.json();
    if (!bets || bets.length === 0) {
      return context.next();
    }

    const bet = bets[0];
    let ogTitle: string;
    let description: string;

    if (bet.resolved && bet.winning_option_index !== null) {
      let winLabel: string;
      if (bet.bet_type === "yesno") {
        winLabel = bet.winning_option_index === 0 ? "Yes" : "No";
      } else {
        const options = bet.options || [];
        winLabel = options[bet.winning_option_index]?.text ?? "Unknown";
      }
      ogTitle = escapeHtml(`The results are in! "${bet.question}" — ${winLabel}!`);
      description = escapeHtml(`${bet.total_predictions} prediction${bet.total_predictions !== 1 ? "s" : ""}${bet.creator_name ? ` · by ${bet.creator_name}` : ""}`);
    } else {
      ogTitle = escapeHtml(bet.question);
      const typeLabel = bet.bet_type === "yesno" ? "Yes/No" : "Multiple Choice";
      description = escapeHtml(`${typeLabel} · ${bet.total_predictions} prediction${bet.total_predictions !== 1 ? "s" : ""}${bet.creator_name ? ` · by ${bet.creator_name}` : ""}`);
    }
    const ogUrl = `https://littlebets.netlify.app/bet/${codeName}`;
    const theme = url.searchParams.get("theme") || "";
    const themeParam = theme ? `&theme=${encodeURIComponent(theme)}` : "";
    const ogImage = `https://littlebets.netlify.app/.netlify/functions/og-image?code=${encodeURIComponent(codeName)}${themeParam}`;

    const response = await context.next();
    const html = await response.text();

    const updatedHtml = html
      .replace(/<title>.*?<\/title>/, `<title>${ogTitle} - Little Bets</title>`)
      .replace(
        /<meta property="og:title" content=".*?" \/>/,
        `<meta property="og:title" content="${ogTitle}" />`
      )
      .replace(
        /<meta property="og:description" content=".*?" \/>/,
        `<meta property="og:description" content="${description}" />`
      )
      .replace(
        /<meta property="og:url" content=".*?" \/>/,
        `<meta property="og:url" content="${ogUrl}" />`
      )
      .replace(
        /<meta name="twitter:card" content=".*?" \/>/,
        `<meta name="twitter:card" content="summary_large_image" />`
      )
      .replace(
        /<meta name="twitter:title" content=".*?" \/>/,
        `<meta name="twitter:title" content="${ogTitle}" />`
      )
      .replace(
        /<meta name="twitter:description" content=".*?" \/>/,
        `<meta name="twitter:description" content="${description}" />`
      )
      .replace(
        /<meta property="og:image" content=".*?" \/>/,
        `<meta property="og:image" content="${ogImage}" />`
      )
      .replace(
        /<meta name="twitter:image" content=".*?" \/>/,
        `<meta name="twitter:image" content="${ogImage}" />`
      );

    return new Response(updatedHtml, {
      headers: response.headers,
    });
  } catch {
    return context.next();
  }
}

export const config = {
  path: "/bet/*",
};
