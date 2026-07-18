'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export interface PatientActionResult {
  ok: boolean;
  error?: string;
}

export async function addMedicalHistory(
  patientId: string,
  description: string,
): Promise<PatientActionResult> {
  const text = description?.trim();
  if (!text) return { ok: false, error: 'Please enter a description.' };

  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) return { ok: false, error: 'Patient not found.' };

  await prisma.medicalHistoryEntry.create({
    data: { patientId, description: text },
  });

  revalidatePath('/admin/patients');
  revalidatePath('/profile');
  return { ok: true };
}

export async function deleteMedicalHistory(entryId: string): Promise<PatientActionResult> {
  await prisma.medicalHistoryEntry.delete({ where: { id: entryId } }).catch(() => {});
  revalidatePath('/admin/patients');
  revalidatePath('/profile');
  return { ok: true };
}
