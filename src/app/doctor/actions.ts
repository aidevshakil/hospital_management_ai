'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getSessionDoctorId } from '@/lib/session';
import type { AppointmentStatus } from '@prisma/client';

export interface DoctorActionResult {
  ok: boolean;
  error?: string;
}

const ALLOWED: AppointmentStatus[] = ['CONFIRMED', 'COMPLETED', 'CANCELLED', 'PENDING'];

/**
 * Update the status of an appointment that belongs to the signed-in doctor.
 * Completing an appointment also stamps the linked patient's `lastVisit`.
 */
export async function setAppointmentStatus(
  appointmentId: string,
  status: string,
): Promise<DoctorActionResult> {
  const doctorId = await getSessionDoctorId();
  if (!doctorId) return { ok: false, error: 'Please sign in.' };

  if (!ALLOWED.includes(status as AppointmentStatus)) {
    return { ok: false, error: 'Invalid status.' };
  }

  const appt = await prisma.appointment.findFirst({
    where: { id: appointmentId, doctorId },
  });
  if (!appt) return { ok: false, error: 'Appointment not found.' };

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: status as AppointmentStatus },
  });

  if (status === 'COMPLETED' && appt.patientId) {
    await prisma.patient
      .update({ where: { id: appt.patientId }, data: { lastVisit: appt.date } })
      .catch(() => {});
  }

  await prisma.notification.create({
    data: {
      message: `Appointment ${appt.code ?? ''} marked ${status.toLowerCase()} by the doctor.`.trim(),
      type: 'APPOINTMENT',
      appointmentId,
    },
  });

  revalidatePath('/doctor');
  revalidatePath('/admin/appointments');
  return { ok: true };
}
