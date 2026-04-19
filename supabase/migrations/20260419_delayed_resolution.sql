-- Delayed Resolution + Reminders (Workstream H)
-- Adds columns for resolve-by date, email reminders, and follow-up tracking.

ALTER TABLE bets
  ADD COLUMN IF NOT EXISTS resolve_by timestamptz,
  ADD COLUMN IF NOT EXISTS reminder_email text,
  ADD COLUMN IF NOT EXISTS reminder_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS followup_sent boolean NOT NULL DEFAULT false;

-- Index for the cron query: find bets that need reminders sent today
CREATE INDEX IF NOT EXISTS idx_bets_reminder_due
  ON bets (resolve_by)
  WHERE resolved = false
    AND reminder_sent_at IS NULL
    AND reminder_email IS NOT NULL;

-- Index for the follow-up query: find bets that need follow-up
CREATE INDEX IF NOT EXISTS idx_bets_followup_due
  ON bets (reminder_sent_at)
  WHERE resolved = false
    AND followup_sent = false
    AND reminder_email IS NOT NULL;
