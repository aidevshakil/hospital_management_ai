'use server';

import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getSessionPatientId } from '@/lib/session';
import { checkSlotConflict } from '@/lib/scheduling';
import type { AppointmentTimeSlot, DocumentType } from '@prisma/client';

export interface ActionResult {
  ok: boolean;
  error?: string;
}

const SLOT_VALUES: AppointmentTimeSlot[] = ['MORNING', 'AFTERNOON', 'EVENING'];

/** Ensure the caller is signed in and owns the given appointment. */
async function ownedAppointment(patientId: string, appointmentId: string) {
  return prisma.appointment.findFirst({ where: { id: appointmentId, patientId } });
}

// ---------------------------------------------------------------------------
// Appointments
// ---------------------------------------------------------------------------

export async function cancelMyAppointment(appointmentId: string): Promise<ActionResult> {
  const patientId = await getSessionPatientId();
  if (!patientId) return { ok: false, error: 'Please sign in.' };

  const appt = await ownedAppointment(patientId, appointmentId);
  if (!appt) return { ok: false, error: 'Appointment not found.' };
  if (appt.status === 'COMPLETED' || appt.status === 'CANCELLED') {
    return { ok: false, error: 'This appointment can no longer be cancelled.' };
  }

  await prisma.appointment.update({ where: { id: appointmentId }, data: { status: 'CANCELLED' } });
  await prisma.notification.create({
    data: {
      message: `Appointment ${appt.code ?? ''} was cancelled by the patient.`.trim(),
      type: 'APPOINTMENT',
      appointmentId,
    },
  });

  revalidatePath('/profile');
  revalidatePath('/admin/appointments');
  return { ok: true };
}

export async function rescheduleMyAppointment(
  appointmentId: string,
  dateStr: string,
  slot: string,
): Promise<ActionResult> {
  const patientId = await getSessionPatientId();
  if (!patientId) return { ok: false, error: 'Please sign in.' };

  const appt = await ownedAppointment(patientId, appointmentId);
  if (!appt) return { ok: false, error: 'Appointment not found.' };
  if (appt.status === 'COMPLETED' || appt.status === 'CANCELLED') {
    return { ok: false, error: 'This appointment can no longer be changed.' };
  }

  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return { ok: false, error: 'Please choose a valid date.' };
  const slotValue = SLOT_VALUES.includes(slot as AppointmentTimeSlot)
    ? (slot as AppointmentTimeSlot)
    : null;
  if (!slotValue) return { ok: false, error: 'Please choose a valid time slot.' };

  const conflict = await checkSlotConflict(appt.doctorId, date, slotValue, appointmentId);
  if (!conflict.ok) return { ok: false, error: conflict.error };

  await prisma.appointment.update({
    where: { id: appointmentId },
    // Reschedule reverts a confirmed booking to PENDING for re-confirmation.
    data: { date, slot: slotValue, time: null, status: 'PENDING' },
  });

  revalidatePath('/profile');
  revalidatePath('/admin/appointments');
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export async function updateMyProfile(input: {
  name: string;
  phone: string;
  address: string;
}): Promise<ActionResult> {
  const patientId = await getSessionPatientId();
  if (!patientId) return { ok: false, error: 'Please sign in.' };

  const name = input.name?.trim();
  if (!name) return { ok: false, error: 'Name is required.' };

  await prisma.patient.update({
    where: { id: patientId },
    data: {
      name,
      phone: input.phone?.trim() || null,
      address: input.address?.trim() || null,
    },
  });

  revalidatePath('/profile');
  return { ok: true };
}

export async function changeMyPassword(
  currentPassword: string,
  newPassword: string,
): Promise<ActionResult> {
  const patientId = await getSessionPatientId();
  if (!patientId) return { ok: false, error: 'Please sign in.' };

  if (!newPassword || newPassword.length < 6) {
    return { ok: false, error: 'New password must be at least 6 characters.' };
  }

  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) return { ok: false, error: 'Account not found.' };

  const ok = await bcrypt.compare(currentPassword ?? '', patient.password);
  if (!ok) return { ok: false, error: 'Your current password is incorrect.' };

  await prisma.patient.update({
    where: { id: patientId },
    data: { password: await bcrypt.hash(newPassword, 10) },
  });

  return { ok: true };
}

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

const MAX_DOC_BYTES = 5 * 1024 * 1024; // 5 MB

function docTypeFromMime(mime: string): DocumentType {
  if (mime === 'application/pdf') return 'PDF';
  if (mime.startsWith('image/')) return 'IMAGE';
  return 'DOC';
}

export async function uploadMyDocument(input: {
  name: string;
  mime: string;
  dataUrl: string; // base64 data URL
}): Promise<ActionResult> {
  const patientId = await getSessionPatientId();
  if (!patientId) return { ok: false, error: 'Please sign in.' };

  const name = input.name?.trim();
  if (!name) return { ok: false, error: 'File name is missing.' };
  if (!input.dataUrl?.startsWith('data:')) return { ok: false, error: 'Invalid file.' };

  // Rough decoded-size estimate from the base64 payload length.
  const base64 = input.dataUrl.slice(input.dataUrl.indexOf(',') + 1);
  const approxBytes = Math.floor((base64.length * 3) / 4);
  if (approxBytes > MAX_DOC_BYTES) {
    return { ok: false, error: 'File is too large (max 5 MB).' };
  }

  await prisma.patientDocument.create({
    data: {
      name,
      type: docTypeFromMime(input.mime || ''),
      url: input.dataUrl,
      patientId,
    },
  });

  revalidatePath('/profile');
  return { ok: true };
}

export async function deleteMyDocument(documentId: string): Promise<ActionResult> {
  const patientId = await getSessionPatientId();
  if (!patientId) return { ok: false, error: 'Please sign in.' };

  // deleteMany scoped by patientId guarantees a patient can only delete their own.
  const res = await prisma.patientDocument.deleteMany({ where: { id: documentId, patientId } });
  if (res.count === 0) return { ok: false, error: 'Document not found.' };

  revalidatePath('/profile');
  return { ok: true };
}
