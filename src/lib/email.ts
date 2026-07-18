import 'server-only';

/**
 * Email delivery via Nodemailer SMTP.
 *
 * Configure with these env vars (frontend/.env):
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE ("true"/"false"),
 *   EMAIL_FROM (e.g. "Hospital AI <no-reply@hospital.example>")
 *
 * When SMTP is not configured, emails are logged to the server console instead
 * of being sent — so the whole flow is testable in development without an
 * account. Sending never throws to the caller: a failed email must not break a
 * booking or registration.
 */
import nodemailer, { type Transporter } from 'nodemailer';

export interface MailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

const FROM = process.env.EMAIL_FROM || 'Hospital AI <no-reply@hospital.local>';

let cachedTransport: Transporter | null | undefined;

function getTransport(): Transporter | null {
  if (cachedTransport !== undefined) return cachedTransport;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port) {
    cachedTransport = null; // not configured -> console fallback
    return cachedTransport;
  }

  cachedTransport = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: process.env.SMTP_SECURE === 'true',
    auth: user && pass ? { user, pass } : undefined,
  });
  return cachedTransport;
}

/** Send an email. Returns true if sent (or logged in dev), false on failure. */
export async function sendMail({ to, subject, html, text }: MailInput): Promise<boolean> {
  if (!to) return false;

  const transport = getTransport();

  if (!transport) {
    // Not configured — log so the flow is observable in development.
    console.log(
      `\n📧 [email:console-fallback] SMTP not configured — would send:\n` +
        `   From:    ${FROM}\n` +
        `   To:      ${to}\n` +
        `   Subject: ${subject}\n` +
        `   ${(text ?? html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim().slice(0, 300)}\n`
    );
    return true;
  }

  try {
    await transport.sendMail({ from: FROM, to, subject, html, text });
    return true;
  } catch (err) {
    console.error(`[email] failed to send "${subject}" to ${to}:`, err);
    return false;
  }
}
