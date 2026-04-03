# Little Bets

Capture group moments through predictions. The bet is the excuse. The gathering is the product.

**Live:** [littlebets.netlify.app](https://littlebets.netlify.app)

---

## Mission

Turn a gathering into a memory. Create a bet, pass the phone around the table, resolve it together. The moment card drops into the group chat. The next morning someone sees it and remembers the whole evening.

## Users

| Segment | Behavior | What they want |
|---------|----------|----------------|
| **The Host** | Creates bets at the table, passes the phone, resolves live | The moment on record. A shareable artifact of the gathering. |
| **The Participant** | Gets handed a phone, locks in a prediction, watches the reveal | Zero friction — no sign-up, no app install needed |
| **The Nostalgic** | Opens the moment card in the group chat the next day | A trigger. The whole evening comes back. |

## Pain points this solves

- Gatherings are ephemeral. You argue, you laugh, you predict — and by morning it's all gone.
- Prediction markets (Polymarket, Kalshi) are too serious — real money, complex UX, strangers.
- There's no lightweight way to capture "we were all there" with proof.

## How it works

1. Type a question, hit Bet — your phone is now a party trick
2. Pass the phone around — everyone locks in a sealed prediction, no sign-up needed
3. Creator resolves it live — confetti, winners, moment card
4. Drop the moment card in the group chat — the memory lives on

## Key product decisions

| Decision | Rationale |
|----------|-----------|
| Anonymous predictions | Removes friction. Sign-up only to *create* bets. |
| Link = distribution | No feed, no algorithm. The group chat is the channel. |
| No real money | Keeps it casual. The fun is the bragging, not the stakes. |
| Pass the phone on creation | After creating a bet, auto-launch pass-the-phone (`?ptp=1`) so the first prediction happens immediately at the table. |
| OG image previews | The link preview in chat is a feature. It drives clicks. |
| Mobile-first | Group chats live on phones. |
| Two themes (Neo / Retro) | People share things that feel like *theirs*. |

## Success metrics

| Metric | Signal |
|--------|--------|
| Bets created → shared | Is the creation-to-share loop completing? |
| Predictions per bet | Are people engaging once they get the link? |
| Return creators | Do instigators come back and make more bets? |
| Resolution rate | Are bets being closed, or abandoned? |

Measured via lightweight event tracking into a Supabase `events` table — no third-party analytics. See `src/lib/analytics.ts`.

## Product approach

Built with the **little bets** philosophy — small, concrete experiments over big plans.

- Ship the smallest useful thing. Watch behavior, not feedback.
- Previous build was scrapped after ~250 iterations of accumulated complexity. This rewrite prioritizes simplicity.
- Inspired by Shane Mac: "The future of prediction markets lives in group chats."

## Learnings

- The previous build died from dependency bloat and over-engineering. Vanilla CSS, strict TypeScript, no libraries.
- Every feature that wasn't immediately useful got cut. A notification system was built then deleted.
- The OG preview image drives more clicks than any feature. Treat it as core product.
- Supabase Realtime has Safari issues. Polling works. Ship what works.

## Stack

React + TypeScript + Supabase + Netlify. Vanilla CSS. Edge functions for OG images.

## For contributors (human or AI)

- All DB queries: `src/lib/supabase.ts` (one file, by design)
- Product backlog: [`BACKLOG.md`](./BACKLOG.md)
- Schema: [`supabase-schema.sql`](./supabase-schema.sql)
- Run `tsc && vite build` after changes. If it doesn't compile, fix before moving on.
