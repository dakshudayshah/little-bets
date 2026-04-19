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

---

## From CEO Review (2026-04-18) — Trust, Two Cards, and Delayed Resolution

### P3: Group Identity (Auto-Groups)
**What:** When the same group of participants appears in 3+ bets, auto-generate a "group" (e.g., "Game Night Crew") from recurring names. Group page shows all their moment cards as a timeline.
**Why:** Turns one-off moments into a relationship artifact. The moment card becomes a recurring group memory, not a one-shot.
**Effort:** M (CC: ~1 hour) — participant matching heuristic + new group table + timeline page.
**Depends on:** Share tracking + enough usage data to validate recurring groups exist.
**Notes:** Name matching is fuzzy (people type "Jake" vs "Jacob"). Could use creator_token to link bets by device as a simpler heuristic.

### P3: Animated Moment Card (GIF/Video)
**What:** Instead of static PNG, generate an animated moment card where faces slide in one by one with predictions, then the result reveals. 5-10 second shareable clip.
**Why:** Way more shareable in group chats and stories. Video/GIF gets more engagement than static images.
**Effort:** L (CC: ~2-3 hours) — canvas animation + video encoding (ffmpeg or similar) + file size optimization.
**Depends on:** Card 1 + Card 2 visual design stabilized.
**Notes:** Could use HTML5 canvas animation recorded via MediaRecorder API, or server-side rendering. File size is the main constraint for mobile sharing.

### P2: Resolution Notification for Participants
**What:** When the creator resolves a bet, email all participants who provided an email: "The bet is resolved! See who called it." Include Card 2 (result card) in the email.
**Why:** Resolution should be a group moment, not a solo action. Participants who aren't in the room deserve to know the outcome.
**Effort:** S (CC: ~20 min) — piggybacks on Workstream H email infrastructure.
**Depends on:** Workstream H (delayed resolution + email infra) shipped.
**Notes:** Need participant email collection during PTP (currently only creator email is collected). Could add optional email field to PTP participation flow.

### P3: Photo Sticker/Cutout Effect
**What:** Apply background removal or vignette effect to participant photos so faces "pop" off the moment card like stickers. Makes the card feel crafted, not like a grid of passport photos.
**Why:** Card quality is the product. A more polished card gets shared more.
**Effort:** S-M (CC: ~30 min) — client-side background removal (e.g., @mediapipe/selfie_segmentation) or server-side API.
**Depends on:** Moment card design stabilized after two-card implementation.
**Notes:** Background removal quality varies by lighting/device. Need fallback to raw circular crop when removal fails. Test on diverse photos.

### P3: Viewer "Remind Me" for Unresolved Bets
**What:** Anyone viewing an unresolved bet page can tap "Remind me when this resolves" and enter their email. When the bet resolves, they get an email with Card 2.
**Why:** Turns spectators into stakeholders. Extends the bet's social reach beyond the original participants.
**Effort:** S (CC: ~15 min) — new `bet_subscribers` table or JSONB column + extend cron function.
**Depends on:** Workstream H email infra shipped.
**Notes:** Needs email validation + unsubscribe link in the email (CAN-SPAM compliance).

### P3: Card 1 Reduced-Motion A11y
**What:** Card 1 fade-in animation (0.3s ease-out on dark-bg → card reveal) should respect `prefers-reduced-motion: reduce`. Replace fade-in with instant appearance when reduced motion is active.
**Why:** DESIGN.md policy: "Replace all scale/flash animations with instant state changes." Card 1's reveal animation is new and easy to forget during implementation.
**Effort:** XS (CC: ~2 min) — 2 lines of CSS in a `@media (prefers-reduced-motion: reduce)` block.
**Depends on:** Workstream G (Two Moment Cards) shipped.
**Notes:** Opacity transitions are allowed per DESIGN.md reduced-motion policy, but Card 1's fade-in is a reveal moment that should be instant for users who prefer reduced motion.

### P2: Cron Double-Send Fix
**What:** The reminder cron can re-send emails if the DB update to mark `reminder_sent_at` fails after the Resend API call succeeds. Fix with optimistic update: set `reminder_sent_at` before calling Resend, clear it on API failure.
**Why:** At current scale (single-digit bets) this is near-impossible. But it's an architectural gap that becomes embarrassing at any real volume.
**Effort:** S (CC: ~5 min) — reorder the cron logic to update DB first, then call Resend.
**Depends on:** Workstream H shipped.
**Notes:** Same pattern applies to `followup_sent`. Consider changing `followup_sent` from boolean to `followup_sent_at` (timestamptz) for consistency with `reminder_sent_at`.
