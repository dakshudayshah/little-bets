import { schedule } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const SITE_URL = process.env.URL || "https://littlebets.netlify.app";

interface ReminderBet {
  id: string;
  code_name: string;
  question: string;
  reminder_email: string;
  total_predictions: number;
}

interface FollowupBet {
  id: string;
  code_name: string;
  question: string;
  reminder_email: string;
}

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Little Bets <onboarding@resend.dev>",
        to,
        subject,
        html,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function getOgImageUrl(codeName: string): string {
  return `${process.env.SUPABASE_URL}/storage/v1/object/public/og-images/${codeName}-stakes.png`;
}

async function sendReminders(): Promise<void> {
  const { data: dueBets, error } = await supabase
    .from("bets")
    .select("id, code_name, question, reminder_email, total_predictions")
    .lte("resolve_by", new Date().toISOString())
    .is("reminder_sent_at", null)
    .eq("resolved", false)
    .not("reminder_email", "is", null);

  if (error || !dueBets) return;

  for (const bet of dueBets as ReminderBet[]) {
    const resolveUrl = `${SITE_URL}/bet/${bet.code_name}`;
    const cardImgUrl = getOgImageUrl(bet.code_name);

    const sent = await sendEmail(
      bet.reminder_email,
      "Time to reveal! \u{1F389}",
      `<div style="font-family: 'Space Grotesk', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <p style="color: #f5f020; font-weight: 700; font-size: 14px;">Little Bets</p>
        <img src="${cardImgUrl}" alt="Moment card" style="width: 100%; border-radius: 4px; margin: 12px 0;" />
        <h2 style="margin: 0 0 8px;">Your bet "${bet.question}" is ready to be resolved.</h2>
        <p style="color: #666;">${bet.total_predictions} people are waiting to see who called it.</p>
        <a href="${resolveUrl}" style="display: inline-block; background: #f5f020; color: #111; padding: 14px 32px; font-weight: 800; text-decoration: none; margin-top: 16px;">Resolve Now</a>
      </div>`
    );

    if (sent) {
      await supabase
        .from("bets")
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq("id", bet.id);
    }
  }
}

async function sendFollowups(): Promise<void> {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

  const { data: followupBets, error } = await supabase
    .from("bets")
    .select("id, code_name, question, reminder_email")
    .not("reminder_sent_at", "is", null)
    .lte("reminder_sent_at", threeDaysAgo)
    .eq("followup_sent", false)
    .eq("resolved", false)
    .not("reminder_email", "is", null);

  if (error || !followupBets) return;

  for (const bet of followupBets as FollowupBet[]) {
    const resolveUrl = `${SITE_URL}/bet/${bet.code_name}`;

    const sent = await sendEmail(
      bet.reminder_email,
      "Still waiting on that answer?",
      `<div style="font-family: 'Space Grotesk', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <p style="color: #f5f020; font-weight: 700; font-size: 14px;">Little Bets</p>
        <h2 style="margin: 0 0 8px;">Your bet "${bet.question}" hasn't been resolved yet.</h2>
        <p style="color: #666;">When you know the answer, tap below.</p>
        <a href="${resolveUrl}" style="display: inline-block; background: #f5f020; color: #111; padding: 14px 32px; font-weight: 800; text-decoration: none; margin-top: 16px;">Resolve Now</a>
      </div>`
    );

    if (sent) {
      await supabase
        .from("bets")
        .update({ followup_sent: true })
        .eq("id", bet.id);
    }
  }
}

export const handler = schedule("@daily", async () => {
  await sendReminders();
  await sendFollowups();
  return { statusCode: 200 };
});
