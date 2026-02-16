# Little Bets — Backlog

Running, categorized backlog of ideas, improvements, and learnings.

---

## Features

- [ ] **Groups / Circles (Bet Tags)** — Hashtag-scoped audiences with per-tag leaderboards. Secret tags via QR/link. Phase 2 of Bet Rings.
- [ ] **Bet Tables** — Ephemeral, content-created groups that auto-archive after 30 days of inactivity. Only if Tags aren't enough.
- [ ] **Bet Drops** — Location/event-anchored ephemeral betting. Viral growth mechanic.
- [ ] **Friends Ring** — Implicit social graph from mutual betting. Show bets from people you've bet with. Defer until user base is larger.
- [ ] **Bet Deadlines** — "Predictions close" date for urgency/FOMO. Drives engagement in group chats.
- [ ] **Comments / Trash Talk** — Lightweight comment thread on each bet. Half the fun is the banter.
- [ ] **Leaderboard Titles** — Fun labels for top predictors per tag/group: #1 "Oracle", top 3 "Sharp".
- [ ] **"I Called It" Share for Winners** — After resolution, winners can tap a personal share button that generates a brag message with their track record.
- [ ] **Prediction Streak on Profile** — Show current streak of correct predictions. "3 in a row" with fire icon.
- [ ] **"X People Are Watching"** — Show visitor/interest count on bets for social proof.

## UX / Quality of Life

- [ ] **Toast Notifications** — Replace browser `alert()` with subtle auto-dismissing toasts for "Link copied!", "Results copied!", etc.
- [ ] **Scroll to Top on Navigation** — SPA bug: navigating between pages doesn't scroll to top.
- [ ] **Haptic Feedback** — `navigator.vibrate()` on predict/resolve for tactile confirmation on mobile.
- [ ] **Dark Mode** — Low-effort via CSS variables, respect `prefers-color-scheme`.
- [ ] **Sign Out on Profile Page** — Currently only in header. Standard to have on Profile too.
- [ ] **Pull-Down to Refresh** — Mobile users expect this on the home feed.
- [ ] **Search / Filter Bets** — Find specific bets quickly on the home page.
- [ ] **Duplicate Name Warning** — Friendly message when someone tries to predict with a name that already voted.
- [ ] **Character Counter** — Show remaining characters on inputs (200 char limit).
- [ ] **Auto-Focus** — Quick create input auto-focuses on page load.
- [ ] **PWA Support** — Installable, works offline, push notifications.

## Technical

- [ ] **Drop `hidden` Column** — Now replaced by `visibility`. Run: `ALTER TABLE bets DROP COLUMN IF EXISTS hidden;`
- [ ] **Pagination / Infinite Scroll** — Home page when bet count grows.
- [ ] **Image Optimization** — Lazy-load OG images, optimize favicon.
- [ ] **Error Boundaries** — Catch React rendering errors gracefully.

## Learnings (from ~250+ iterations of previous build)

- **No Chakra UI / heavy component libraries** — Caused dependency conflicts and build failures. Vanilla CSS only.
- **Strict TypeScript** — `noUnusedLocals` + `noUnusedParameters` catches the #1 source of build failures.
- **No Supabase Realtime** — WebSocket issues in Safari. Use polling or manual refetch.
- **TEXT with CHECK > ENUM** — Avoids painful enum migrations in Postgres.
- **All Supabase queries in one file** — Prevents code duplication and import issues.
- **No icon libraries** — lucide-react was added but never installed in old build. Use inline SVG or text.
- **No speculative code** — Only write what's needed now. Previous build had notification system that was over-engineered then removed.
- **Backpressure checks** — `tsc && vite build` after every meaningful change. If it doesn't compile, fix before moving on.
- **HTML entity escaping in OG edge function** — Prevent meta tag injection from malicious bet questions.
- **RLS policies matter** — DB triggers won't fire if the calling user doesn't have the right RLS policy (e.g., UPDATE on bets for count triggers).
- **Netlify env vars** — Spaces in JWT keys cause "invalid API key" errors. Always verify.
- **Shane Mac's thesis** — "The future of prediction markets lives in group chats." The link IS the distribution mechanism.
