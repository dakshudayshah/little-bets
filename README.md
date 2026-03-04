# Little Bets

Make predictions with friends. Bragging rights, no real money.

**Live:** [littlebets.netlify.app](https://littlebets.netlify.app)

---

## Mission

Make casual predictions a social activity that lives where friends already talk — group chats.

## Users

| Segment | Behavior | What they want |
|---------|----------|----------------|
| **The Instigator** | Creates bets, drops links in group chats, stirs debate | To be right and be *seen* being right |
| **The Voter** | Taps a link, picks a side, moves on | Zero friction — no sign-up, no commitment |
| **The Scorekeeper** | Checks results, tracks records, shares wins | Proof. Bragging receipts. |

## Pain points this solves

- Predictions in group chats disappear in scroll. No one remembers who said what.
- Prediction markets (Polymarket, Kalshi) are too serious — real money, complex UX, strangers.
- There's no lightweight way to say "I called it" with proof.

## How it works

1. Create a bet (yes/no or multiple choice)
2. Share the link — anyone can predict, no sign-up needed
3. Creator resolves it — confetti, winners, bragging rights

## Key product decisions

| Decision | Rationale |
|----------|-----------|
| Anonymous predictions | Removes friction. Sign-up only to *create* bets. |
| Link = distribution | No feed, no algorithm. The group chat is the channel. |
| No real money | Keeps it casual. The fun is the bragging, not the stakes. |
| Auto-copy link on creation | The first action after creating a bet is sharing it. Remove that step. |
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
