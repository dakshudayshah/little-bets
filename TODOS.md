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

---

## From /qa Run (2026-05-17) — Deferred Issues

### ~~P1: Unify desktop and mobile navigation (ISSUE-003)~~ ✓ FIXED 2026-05-17
**What:** Desktop top nav now matches the mobile bottom nav: Home / Create / My Bets / Settings. The /profile route remains as an alias and highlights the My Bets tab.

### P1: Reconcile the two create flows (ISSUE-004)
**What:** The homepage embedded form asks Question + Yes/No vs MC + "When will you know?" (date). The `/create` page asks Bet Type + Question + Your Name + Description + Visibility (no date). These build different bet shapes from the same product.
**Why:** Date is critical for the delayed-resolution feature but only collectable from the home form. Name + visibility only collectable from /create. The fork is invisible to the user.
**Effort:** M (CC: ~45 min) — pick one canonical form, redirect or merge the other.
**Notes:** Found during /qa 2026-05-17. Recommend keeping the homepage form as the canonical "Straight to the Moment" path; redirect `/create` → `/` or align field set.

### P3: Resolved-bet toast should not overlap moment card (ISSUE-008)
**What:** After resolving a bet, the dark toast "Bet resolved! Scroll down to share the moment." renders bottom-center, which lands on top of the moment card preview as the user scrolls.
**Why:** Obscures the artifact that the user is trying to share.
**Effort:** XS (CC: ~5 min) — anchor toast bottom-right on desktop, or auto-dismiss faster, or drop the toast entirely since the moment card section already says "Share the Moment".
**Notes:** Found during /qa 2026-05-17. Reproduction is scroll-dependent (visible in screenshot `qa-reports/screenshots/20-after-resolve.png`).

### P3: Pass the Phone CTA visual hierarchy on bet detail Neo (ISSUE-013)
**What:** The "Pass the Phone" hero CTA on the bet detail page uses `--color-bg` yellow — same as the page background. The black border and hard shadow carry the affordance, but the color hierarchy is gone.
**Why:** Per DESIGN.md the Primary CTA is yellow on yellow, designed for white surfaces. On a yellow page bg the CTA reads as "outlined region", not "primary action".
**Effort:** XS (CC: ~5 min) — either give the bet-detail CTA a surface bg (white card) or update the Primary CTA spec in DESIGN.md to clarify on-yellow-bg behavior.
**Notes:** Found during /qa 2026-05-17. Worth a brief design review before patching — touches DESIGN.md.

---

### P2: Cron Double-Send Fix
**What:** The reminder cron can re-send emails if the DB update to mark `reminder_sent_at` fails after the Resend API call succeeds. Fix with optimistic update: set `reminder_sent_at` before calling Resend, clear it on API failure.
**Why:** At current scale (single-digit bets) this is near-impossible. But it's an architectural gap that becomes embarrassing at any real volume.
**Effort:** S (CC: ~5 min) — reorder the cron logic to update DB first, then call Resend.
**Depends on:** Workstream H shipped.
**Notes:** Same pattern applies to `followup_sent`. Consider changing `followup_sent` from boolean to `followup_sent_at` (timestamptz) for consistency with `reminder_sent_at`.

---

## From QA (2026-06-27) — PTP UI focus, World Cup launch prep

### ~~CRITICAL: Stakes card (Card 1) empty render after PTP Done (ISSUE-014)~~ ✓ FIXED 2026-06-27 (commit 395faee)
**What was wrong:** `PTPContext.participants` loaded once on mount, never refreshed after LOCK IT IN. Tapping "Done? Show Results" rendered the Stakes card with `participants=[]` — "0 locked in", no avatars, no vote counts.
**Why it mattered:** Card 1 is the artifact users share to group chats while bets are pending. Empty card = dead share loop. Would have killed every Cup watch-party share in the launch plan.
**Fix:** `handleDone` now awaits `fetchParticipants(bet.id)` and writes to context before transitioning to step `card1`. Regression test at `src/components/__tests__/PassThePhoneMode.regression-1.test.tsx`.

### P2: Photo primer card shows only current user (ISSUE-015)
**What:** During PTP, after each LOCK IT IN, the photo permission primer shows a mini moment card. The card iterates only UPLOADED photos plus a "you" placeholder. When no one uploads, every subsequent participant sees only their own initial, not the group.
**Why:** Copy says "Your photo goes on the group's moment card" but the visual contradicts it — looks like you're alone on the card. Undermines the social-proof framing.
**Effort:** S (CC: ~10 min) — with ISSUE-014 fixed, `participants` is available in context on the primer step too. Render initials for participants without photos, matching the actual Stakes card layout.
**Depends on:** None. ISSUE-014 fix makes the data available.
**Notes:** Design call: should the primer match Card 1 exactly, or stay deliberately minimal to emphasize "your photo can go HERE"? Found during /qa 2026-06-27. Evidence: `.gstack/qa-reports/screenshots/qa-10-ptp-p2-locked.png` and `qa-12-ptp-p3-locked.png`.

### P3: Home inspiration cards not in a11y tree (ISSUE-016)
**What:** The 8 inspiration cards on home (Gender Reveal, Watch Party, Team Dinner, Birthday, Trip, Karaoke, Baby Shower, Game Night) are `<div onClick>` with `cursor: pointer`. They have no role, no aria-label, no tabindex. Screen readers can't find them; keyboard users can't activate them.
**Why:** Accessibility + makes them un-clickable via `$B` testing tools (have to use `-C` clickable mode instead of standard refs).
**Effort:** XS (CC: ~5 min) — change the wrapper to `<button type="button" aria-label="Use {title} inspiration">` in `src/pages/HomePage.tsx`.
**Notes:** Found during /qa 2026-06-27. Worth doing alongside other a11y polish; not blocking.

### P3: requestFullscreen warning on PTP entry (ISSUE-017)
**What:** Every PTP route load triggers `Failed to execute 'requestFullscreen' on 'Element': API can only be initiated by a user gesture.` in console. The useEffect at `src/components/PassThePhoneMode.tsx:34–40` calls `el.requestFullscreen()` on mount, but browsers reject auto-fullscreen without a preceding user gesture.
**Why:** Cosmetic, but pollutes the console and makes real errors harder to spot. Also means fullscreen never actually activates — the feature is broken silently.
**Effort:** XS (CC: ~5 min) — either tie `requestFullscreen` to first user click (e.g., on radio pick) or remove the call entirely.
**Notes:** Found during /qa 2026-06-27. If the fullscreen behavior was important, the gesture-tied version is the real fix; if it wasn't, removing the call is cleaner.

### Deferred PTP coverage (not exercised during this QA)
The 2026-06-27 PTP run focused on the multi-participant happy path and Card 1 reveal. The following should be covered before the next major PTP-touching change:
- Photo upload path (only photo skip was tested)
- Browser refresh mid-PTP (does state persist? does PTPContext re-fetch correctly?)
- Same name twice (duplicate handling — submitPrediction returns "duplicate" error per source)
- Very long names (UI overflow on the primer and Stakes card)
- Resolve Now → Card 2 (Result) reveal end-to-end
- Mobile viewport (375x812) — DONE via /plan-design-review 2026-06-27, see findings below

---

## From /plan-design-review (2026-06-27) — PTP mobile audit

Full review: `~/.gstack/projects/dakshudayshah-little-bets/admin-main-design-review-20260627T2242.md`
Mockup HTMLs: `~/.gstack/projects/dakshudayshah-little-bets/designs/ptp-mobile-audit-20260627/`

### P1: Inspiration dialog Start/Cancel unreachable on mobile (ISSUE-018)
**What:** The bottom-sheet modal that opens when tapping any home inspiration card (Watch Party, Gender Reveal, etc) renders its primary actions (Start, Cancel) below the fixed bottom nav on iPhone 13 (375×812). Both buttons are visually obscured AND functionally non-tappable. User is trapped in the modal until they refresh.
**Why:** This breaks the fastest path to creating a Cup bet from a phone. Per the design doc, Watch Party is THE inspiration the founder would use to dogfood at the next colleague watch. Per DESIGN.md z-index hierarchy: bottom nav = 100, auth modal = 200, PTP = 250. The inspiration dialog has no documented z-index and appears to default to ≤100, so the nav wins. CRITICAL severity, mobile-only.
**Effort:** XS (CC: ~5 min) — give the dialog `z-index: 200` (treat as modal, like auth) in `HomePage.tsx` or wherever the dialog is rendered. Alternative: hide bottom nav when any modal is open. Also: add a "Modal / dialog" row to the Z-Index Hierarchy table in DESIGN.md so this doesn't happen again.
**Evidence:** `.gstack/qa-reports/screenshots/ptp-mobile/ISSUE-018-inspiration-dialog-blocked.png`

### P1: Thumb zone violations on PTP pick + name steps (ISSUE-019)
**What:** On iPhone 13, the Yes/No buttons sit at y=290-440 and the Next/LOCK IT IN CTAs at y=440-510. From y=510-812 (~300px) is empty. Primary tap targets are dead-center on the screen, requiring a grip shift for one-handed use.
**Why:** PTP is a one-thumb mobile game played at a watch party. Every tap should feel reachable. The "Start passing" intro screen already does this correctly (CTA at bottom). The pick + name + handoff screens don't follow the same composition principle.
**Effort:** S-M (CC: ~30-60 min) — CSS layout change to `PassThePhoneMode.tsx`. Anchor the action cluster (options + CTA) to the bottom of the viewport. Question stays top. See mockup: `mockup-A-pick-step-redesigned.html`.
**Depends on:** None.
**Notes:** The pick step is the highest-volume screen (every participant taps it at least once). Single largest UX improvement available right now.

### P1: "Done? Show Results" visible at 0 predictions (ISSUE-020)
**What:** The top-left "Done? Show Results" button is rendered on the PTP overlay even when zero predictions exist. Tapping it leads to an empty/broken Stakes card state.
**Why:** Per DESIGN.md "Subtraction default" — if an action does nothing useful, remove it from the surface. Currently this CTA shouts "you can stop now!" before anyone's even locked in.
**Effort:** XS (CC: ~5 min) — conditional render in `PassThePhoneMode.tsx`: only show `.ptp-done-btn` when `localCount >= 1`. Alternative: render as disabled with helper text "Lock in your first prediction first".

### P2: Card 1 action stack has wrong primary (ISSUE-021)
**What:** On the Stakes card screen, "Resolve now" is the yellow primary CTA and "Save for Instagram" is a stark white button. For an unresolved Cup match (the delayed-resolution use case Card 1 was designed for), the primary should be **"Share the stakes"** — that's the act that ships the bet to the group chat. "Save for Instagram" being white inside a dark surface shouts louder than its actual priority warrants.
**Why:** Per the design doc, Card 1 exists to be shared to a group chat while the bet is still open. Resolve flows happen AFTER the match. The primary CTA should match the primary intent, not the developer's natural focus.
**Effort:** S (CC: ~15 min) — reorder + restyle the 4 action buttons in `PassThePhoneMode.tsx` (the `step === 'card1'` block). See mockup: `mockup-B-card1-action-hierarchy.html`.
**Notes:** Worth confirming with the design intent before swapping — there's a chance the current order is deliberate. Quick chat-level check.

### P2: Handoff disabled state is opaque (ISSUE-022)
**What:** During the 1.5s tap-lock after LOCK IT IN, the handoff button shows `...` in dim yellow with no countdown, progress, or copy explaining the wait. Impatient mobile tappers will think the app froze.
**Why:** The lock exists to prevent the previous participant's accidental double-tap from skipping the handoff. It's a safety mechanism that's currently being communicated as a frozen UI.
**Effort:** XS-S (CC: ~5-15 min). Three options in order of polish: (a) shorten to 0.5s (probably enough to prevent the double-tap), (b) add a 1.5s countdown ring around the button, (c) fade-in the "I'M READY" copy after a 1.5s delay so the user sees movement.

### Open design system question
DESIGN.md's z-index hierarchy table doesn't have a "Modal / dialog" row. ISSUE-018 wouldn't have happened if the inspiration dialog's z-index had been spec'd against a documented token. Worth adding: `| Modal / dialog | 200 | Inspiration dialog, confirmation modals, generic overlays |` alongside the existing auth-modal entry.
