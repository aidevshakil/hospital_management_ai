'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getSessionPatientId } from '@/lib/session';
import { sendAppointmentConfirmation } from '@/lib/emails';
import { appointmentCode } from '@/lib/codes';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import { checkSlotConflict } from '@/lib/scheduling';
import type { AppointmentTimeSlot } from '@prisma/client';

export interface BookingInput {
  name: string;
  email: string;
  phone: string;
  department: string;
  doctorId: string; // '' = any
  date: string; // yyyy-mm-dd
  time: string; // 'morning' | 'afternoon' | 'evening'
  symptoms: string;
}

export interface BookingResult {
  ok: boolean;
  code?: string;
  error?: string;
}

const SLOT_MAP: Record<string, AppointmentTimeSlot> = {
  morning: 'MORNING',
  afternoon: 'AFTERNOON',
  evening: 'EVENING',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function createAppointment(input: BookingInput): Promise<BookingResult> {
  const name = input.name?.trim();
  const email = input.email?.trim().toLowerCase();
  const phone = input.phone?.trim();

  const ip = await clientIp();
  if (!rateLimit(`booking:${ip}`, 8, 60 * 60 * 1000).ok) {
    return { ok: false, error: 'Too many booking attempts. Please try again later.' };
  }

  if (!name || !email || !phone || !input.date || !input.time) {
    return { ok: false, error: 'Please fill in your name, email, phone, date, and time.' };
  }
  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: 'Please enter a valid email address.' };
  }

  const slot = SLOT_MAP[input.time];
  const date = new Date(input.date);
  if (Number.isNaN(date.getTime())) {
    return { ok: false, error: 'Invalid date.' };
  }

  // Resolve department + doctor.
  const department = input.department
    ? await prisma.department.findUnique({ where: { name: input.department } })
    : null;

  let doctor = null;
  if (input.doctorId) {
    doctor = await prisma.doctor.findUnique({ where: { id: input.doctorId }, include: { department: true } });
  }

  // Reject bookings that clash with the doctor's availability or an existing slot.
  const conflict = await checkSlotConflict(doctor?.id ?? null, date, slot ?? null);
  if (!conflict.ok) {
    return { ok: false, error: conflict.error };
  }

  // Link to the signed-in patient, if any (guest bookings stay unlinked).
  const patientId = await getSessionPatientId();

  // Create first (assigns race-free `seq`), then derive the human-readable code.
  const created = await prisma.appointment.create({
    data: {
      date,
      slot,
      symptoms: input.symptoms?.trim() || null,
      status: 'PENDING',
      patientName: name,
      patientEmail: email,
      patientPhone: phone,
      patientId: patientId ?? undefined,
      doctorId: doctor?.id ?? null,
      departmentId: doctor?.departmentId ?? department?.id ?? null,
    },
  });
  const code = appointmentCode(created.seq);
  const appointment = await prisma.appointment.update({
    where: { id: created.id },
    data: { code },
  });

  // Send a confirmation email (never blocks / fails the booking).
  await sendAppointmentConfirmation({
    patientName: name,
    patientEmail: email,
    code,
    date,
    time: null,
    slot,
    doctorName: doctor?.name ?? null,
    departmentName: doctor?.department?.name ?? department?.name ?? null,
  });

  // Keep the patient's "last visit" fresh when they book while signed in.
  if (patientId) {
    await prisma.patient.update({ where: { id: patientId }, data: { lastVisit: date } }).catch(() => {});
  }

  await prisma.notification.create({
    data: {
      message: doctor
        ? `New appointment booked with ${doctor.name}.`
        : `New appointment request from ${name}.`,
      type: 'APPOINTMENT',
      appointmentId: appointment.id,
    },
  });

  // Refresh admin views that show appointments / notifications.
  revalidatePath('/admin');
  revalidatePath('/admin/appointments');
  revalidatePath('/admin/notifications');

  return { ok: true, code };
}
