# Little Bets — TODOs

Deferred work from reviews. Each item has context so someone picking it up in 3 months understands the motivation.

---

## From CEO Review (2026-03-30) — Happy Hour Mode

### P2: Sound Effects on LOCK IT IN
**What:** Add a short audio cue (click/lock sound) when someone taps LOCK IT IN during pass-the-phone.
**Why:** The sound makes each prediction an event the whole table hears. Creates shared anticipation.
**Effort:** S (CC: ~5 min) — one ~5KB MP3 + `new Audio('lock.mp3').play()` after vibrate call.
**Depends on:** PR 2 (pass-the-phone) shipped.
**Notes:** Audio playback on mobile has quirks (autoplay policies, mute switch). Test on Android + iOS.

### P2: Anonymous-to-Authenticated Upgrade Path
**What:** On sign-in, check localStorage for creator_tokens and call RPC `claim_anonymous_bets` to set creator_id on those bets. Anonymous bets appear on profile.
**Why:** Someone creates 5 bets at happy hour, signs up next day, expects to see their bets.
**Effort:** S (CC: ~10 min) — 1 RPC + ~20 lines in AuthContext.
**Depends on:** PR 1 (anonymous creation) shipped.
**Notes:** Edge case: two people on the same device both sign in. Tokens are per-device, not per-person.

### P3: Sealed Prediction Name Tease
**What:** When predictions are sealed, show participant names (not predictions) instead of count badge. "Jake, Priya, and 4 others have locked in."
**Why:** Social proof + suspense. You know WHO played but not what they picked.
**Effort:** S (CC: ~5 min) — ~15 lines in BetStats sealed rendering.
**Depends on:** PR 3 (sealed predictions) shipped.
**Notes:** sealed_bet_participants view already returns names. Truncate at 3 names + "and N others" for lists > 3.

### ~~P1: Moment Card Share Not Working~~ ✓ COMPLETED v0.1 (2026-04-03)
**What:** Implemented 4-step share fallback chain in `MomentCard.tsx`: (1) `navigator.canShare({files})` → native share with PNG, (2) show long-press hint with inline `<img>` for save-to-photos, (3) `<a download>` click, (4) `navigator.clipboard.writeText(betUrl)`.
**Result:** Share works across iOS Safari, Android Chrome, and desktop browsers.

---

## From CEO Review (2026-04-04) — Persistent Photos

### P3: Admin Delete Script with Storage Photo Cleanup
**What:** A script (or SQL + Storage CLI commands) to delete old bets and their associated photos from Supabase Storage. Currently, deleting a bet row leaves orphaned photos in `ptp-photos/{bet_id}/`.
**Why:** User needs to clean up test bets and old data. Manual dashboard deletion works for rows but misses Storage files.
**Effort:** S (CC: ~10 min) — SQL delete + `supabase storage rm` for the bet folder.
**Depends on:** Persistent photos feature shipped (ptp-photos bucket exists).
**Notes:** Could be a simple bash script or a Supabase edge function. Consider a cascade trigger on `bets` table delete, but manual is fine for now.

### P3: Participant Photo Self-Deletion Mechanism
**What:** Allow a participant to request deletion of their photo from a bet. No auth system exists, so this would need some form of verification (e.g., a unique link sent during PTP, or admin-only action).
**Why:** Privacy. Someone might not want their photo on a shared card after the fact.
**Effort:** M (CC: ~20 min) — needs UX design for the request flow since there's no auth.
**Depends on:** Persistent photos feature shipped.
**Notes:** Not urgent for v1 (small friend groups, high trust). Revisit if the app scales beyond close social circles.

---

## From Design Review (2026-04-04) — Persistent Photos

### P2: Update DESIGN.md with Moment Card Photo-Hero Elements
**What:** After implementing the photo-hero moment card, update DESIGN.md to document: winner ring spec (3px solid #f5f020 stroke, no shadowBlur), checkmark badge (24px yellow circle), photo avatar sizing (68px radius, 120px spacing, centered), prediction labels (14px, yellow/muted), unresolved card state, and the #666→#888 subtle color alignment.
**Why:** DESIGN.md is the design system source of truth. New visual elements should be documented so future changes stay consistent.
**Effort:** S (CC: ~5 min) — add a "Moment Card" section to DESIGN.md.
**Depends on:** Photo-hero moment card implementation shipped.
**Notes:** Also document the OG image redesign (dark bg, matching moment card layout).
