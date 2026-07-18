import 'server-only';

/**
 * Email templates + high-level senders for the hospital app.
 * All senders are safe to await from Server Actions; they never throw.
 */
import { sendMail } from '@/lib/email';
import { formatDate } from '@/lib/format';

const SLOT_LABEL: Record<string, string> = {
  MORNING: 'Morning (9 AM – 12 PM)',
  AFTERNOON: 'Afternoon (1 PM – 4 PM)',
  EVENING: 'Evening (5 PM – 8 PM)',
};

function layout(title: string, bodyHtml: string): string {
  return `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f172a">
    <div style="font-size:20px;font-weight:800;margin-bottom:4px">Hospital<span style="color:#2563eb">AI</span></div>
    <h1 style="font-size:18px;margin:16px 0">${title}</h1>
    ${bodyHtml}
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0"/>
    <p style="font-size:12px;color:#64748b">This is an automated message from Hospital AI. Please do not reply to this email.</p>
  </div>`;
}

export interface AppointmentEmailData {
  patientName: string;
  patientEmail: string | null;
  code: string | null;
  date: Date;
  time: string | null;
  slot: string | null;
  doctorName?: string | null;
  departmentName?: string | null;
}

function appointmentDetails(a: AppointmentEmailData): string {
  const when = a.time || (a.slot ? SLOT_LABEL[a.slot] ?? a.slot : 'To be confirmed');
  const rows: [string, string][] = [
    ['Reference', a.code ?? '—'],
    ['Date', formatDate(a.date)],
    ['Time', when],
    ['Department', a.departmentName ?? '—'],
    ['Doctor', a.doctorName ?? 'To be assigned'],
  ];
  return `<table style="width:100%;border-collapse:collapse;font-size:14px">${rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 0;color:#64748b;width:120px">${k}</td><td style="padding:6px 0;font-weight:600">${v}</td></tr>`
    )
    .join('')}</table>`;
}

/** Welcome email after a patient registers. */
export async function sendWelcomeEmail(patient: { name: string; email: string }): Promise<void> {
  await sendMail({
    to: patient.email,
    subject: 'Welcome to Hospital AI',
    html: layout(
      `Welcome, ${patient.name}!`,
      `<p style="font-size:14px;line-height:1.6">Your Hospital AI account has been created successfully. You can now book appointments, view your history, and receive confirmations and reminders by email.</p>`
    ),
    text: `Welcome, ${patient.name}! Your Hospital AI account has been created successfully.`,
  });
}

/** Confirmation email when an appointment is booked. */
export async function sendAppointmentConfirmation(a: AppointmentEmailData): Promise<void> {
  if (!a.patientEmail) return;
  await sendMail({
    to: a.patientEmail,
    subject: `Appointment received${a.code ? ` (${a.code})` : ''} — Hospital AI`,
    html: layout(
      `Hi ${a.patientName}, we've received your appointment request`,
      `<p style="font-size:14px;line-height:1.6">Our team will confirm your slot shortly. Here are the details:</p>${appointmentDetails(a)}`
    ),
    text: `Hi ${a.patientName}, we've received your appointment request (${a.code ?? ''}) for ${formatDate(a.date)}.`,
  });
}

/** Reminder email ahead of an upcoming appointment. */
export async function sendAppointmentReminder(a: AppointmentEmailData): Promise<void> {
  if (!a.patientEmail) return;
  await sendMail({
    to: a.patientEmail,
    subject: `Reminder: your appointment on ${formatDate(a.date)} — Hospital AI`,
    html: layout(
      `Hi ${a.patientName}, this is a reminder of your upcoming appointment`,
      `${appointmentDetails(a)}<p style="font-size:14px;line-height:1.6;margin-top:16px">Please arrive 15 minutes early. If you need to reschedule, contact us in advance.</p>`
    ),
    text: `Reminder: your appointment ${a.code ?? ''} is on ${formatDate(a.date)}.`,
  });
}
