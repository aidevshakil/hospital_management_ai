import 'server-only';

import { prisma } from '@/lib/prisma';
import type { AppointmentTimeSlot } from '@prisma/client';

/**
 * Appointment scheduling guards: honour a doctor's advertised availability and
 * prevent double-booking the same doctor into the same date + time slot.
 */

const DAY_ABBR = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

/**
 * True if `availableDays` (free-text like "Mon, Wed, Fri" or "Monday-Friday")
 * covers the given date. Unset/blank availability is treated as "any day".
 */
export function doctorWorksOn(availableDays: string | null | undefined, date: Date): boolean {
  if (!availableDays || !availableDays.trim()) return true;
  const target = DAY_ABBR[date.getDay()]!;
  const text = availableDays.toLowerCase();

  // Range form, e.g. "mon-fri".
  const range = text.match(/(sun|mon|tue|wed|thu|fri|sat)[a-z]*\s*[-–]\s*(sun|mon|tue|wed|thu|fri|sat)/);
  if (range) {
    const start = DAY_ABBR.indexOf(range[1]!);
    const end = DAY_ABBR.indexOf(range[2]!);
    if (start !== -1 && end !== -1) {
      const idx = DAY_ABBR.indexOf(target);
      if (start <= end) return idx >= start && idx <= end;
      return idx >= start || idx <= end; // wrap-around range
    }
  }

  return text.includes(target);
}

export interface SlotConflict {
  ok: boolean;
  error?: string;
}

/**
 * Validate a prospective booking for `doctorId` on `date`/`slot`.
 * `excludeAppointmentId` skips a row (used when rescheduling an existing one).
 */
export async function checkSlotConflict(
  doctorId: string | null,
  date: Date,
  slot: AppointmentTimeSlot | null,
  excludeAppointmentId?: string,
): Promise<SlotConflict> {
  if (!doctorId) return { ok: true }; // no specific doctor → nothing to conflict with

  const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
  if (!doctor) return { ok: true };

  if (!doctorWorksOn(doctor.availableDays, date)) {
    return {
      ok: false,
      error: `${doctor.name} is not available on that day${
        doctor.availableDays ? ` (available: ${doctor.availableDays})` : ''
      }. Please pick another date.`,
    };
  }

  if (!slot) return { ok: true };

  // Same calendar day window.
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const clash = await prisma.appointment.findFirst({
    where: {
      doctorId,
      slot,
      date: { gte: dayStart, lt: dayEnd },
      status: { in: ['PENDING', 'CONFIRMED'] },
      ...(excludeAppointmentId ? { id: { not: excludeAppointmentId } } : {}),
    },
  });

  if (clash) {
    return {
      ok: false,
      error: `${doctor.name} is already booked for that time slot. Please choose a different slot or date.`,
    };
  }

  return { ok: true };
}
