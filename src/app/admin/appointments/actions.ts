'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { sendAppointmentConfirmation } from '@/lib/emails';
import type { AppointmentStatus } from '@prisma/client';

export interface AppointmentFormInput {
  patient: string;
  email: string;
  phone: string;
  address: string;
  doctor: string; // doctor name (free text / autocomplete)
  date: string; // yyyy-mm-dd
  time: string; // HH:MM
  status: string; // 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled'
}

function toStatus(label: string): AppointmentStatus {
  return label.toUpperCase() as AppointmentStatus;
}

async function resolveDoctorId(name: string): Promise<string | null> {
  const trimmed = name?.trim();
  if (!trimmed) return null;
  const doc = await prisma.doctor.findFirst({ where: { name: trimmed } });
  return doc?.id ?? null;
}

export async function createAppointment(input: AppointmentFormInput) {
  const doctorId = await resolveDoctorId(input.doctor);
  const doctor = doctorId
    ? await prisma.doctor.findUnique({ where: { id: doctorId } })
    : null;
  const count = await prisma.appointment.count();

  const code = `#APT-${1000 + count + 1}`;
  const date = new Date(input.date);
  const email = input.email?.trim() || null;

  await prisma.appointment.create({
    data: {
      code,
      date,
      time: input.time || null,
      status: toStatus(input.status),
      patientName: input.patient,
      patientEmail: email,
      patientPhone: input.phone || null,
      patientAddress: input.address || null,
      doctorId,
      departmentId: doctor?.departmentId ?? null,
    },
  });

  if (email) {
    const department = doctor?.departmentId
      ? await prisma.department.findUnique({ where: { id: doctor.departmentId } })
      : null;
    await sendAppointmentConfirmation({
      patientName: input.patient,
      patientEmail: email,
      code,
      date,
      time: input.time || null,
      slot: null,
      doctorName: doctor?.name ?? null,
      departmentName: department?.name ?? null,
    });
  }

  revalidatePath('/admin/appointments');
  revalidatePath('/admin');
}

export async function updateAppointment(id: string, input: AppointmentFormInput) {
  const doctorId = await resolveDoctorId(input.doctor);
  const doctor = doctorId
    ? await prisma.doctor.findUnique({ where: { id: doctorId } })
    : null;

  await prisma.appointment.update({
    where: { id },
    data: {
      date: new Date(input.date),
      time: input.time || null,
      status: toStatus(input.status),
      patientName: input.patient,
      patientEmail: input.email?.trim() || null,
      patientPhone: input.phone || null,
      patientAddress: input.address || null,
      doctorId,
      departmentId: doctor?.departmentId ?? null,
    },
  });

  revalidatePath('/admin/appointments');
  revalidatePath('/admin');
}

export async function cancelAppointment(id: string) {
  await prisma.appointment.update({ where: { id }, data: { status: 'CANCELLED' } });
  revalidatePath('/admin/appointments');
  revalidatePath('/admin');
}
