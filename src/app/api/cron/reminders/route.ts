import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendAppointmentReminder } from '@/lib/emails';

/**
 * Sends reminder emails for upcoming appointments.
 *
 * Trigger this on a schedule (e.g. hourly) with an external cron / scheduler:
 *   curl -H "Authorization: Bearer $CRON_SECRET" https://yourhost/api/cron/reminders
 *
 * It picks appointments that are:
 *   - not cancelled, have an email, and haven't been reminded yet
 *   - happening within the next REMINDER_WINDOW_HOURS (default 48h)
 * Each gets one reminder; `reminderSentAt` is stamped so it isn't sent twice.
 */

const WINDOW_HOURS = Number(process.env.REMINDER_WINDOW_HOURS ?? 48);

function authorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get('authorization');
  if (header === `Bearer ${secret}`) return true;
  if (request.nextUrl.searchParams.get('secret') === secret) return true;
  return false;
}

async function handle(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const windowEnd = new Date(now.getTime() + WINDOW_HOURS * 60 * 60 * 1000);

  const due = await prisma.appointment.findMany({
    where: {
      reminderSentAt: null,
      patientEmail: { not: null },
      status: { not: 'CANCELLED' },
      date: { gte: now, lte: windowEnd },
    },
    include: { doctor: { include: { department: true } }, department: true },
  });

  let sent = 0;
  for (const a of due) {
    await sendAppointmentReminder({
      patientName: a.patientName,
      patientEmail: a.patientEmail,
      code: a.code,
      date: a.date,
      time: a.time,
      slot: a.slot,
      doctorName: a.doctor?.name ?? null,
      departmentName: a.doctor?.department?.name ?? a.department?.name ?? null,
    });
    await prisma.appointment.update({ where: { id: a.id }, data: { reminderSentAt: new Date() } });
    sent++;
  }

  return NextResponse.json({ ok: true, windowHours: WINDOW_HOURS, candidates: due.length, sent });
}

export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}
