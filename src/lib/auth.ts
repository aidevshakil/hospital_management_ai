import 'server-only';

import { prisma } from '@/lib/prisma';
import { getSessionPatientId, getSessionAdminId } from '@/lib/session';
import type { PublicPatient } from '@/lib/auth-types';

/** Return the currently signed-in patient (without the password hash), or null. */
export async function getCurrentPatient(): Promise<PublicPatient | null> {
  const id = await getSessionPatientId();
  if (!id) return null;

  const patient = await prisma.patient.findUnique({ where: { id } });
  if (!patient) return null;

  return {
    id: patient.id,
    name: patient.name,
    email: patient.email,
    phone: patient.phone ?? '',
    address: patient.address ?? '',
  };
}

export interface PublicAdmin {
  id: string;
  name: string;
  email: string;
  role: string;
}

/** Return the currently signed-in admin, or null. */
export async function getCurrentAdmin(): Promise<PublicAdmin | null> {
  const id = await getSessionAdminId();
  if (!id) return null;

  const admin = await prisma.admin.findUnique({ where: { id } });
  if (!admin) return null;

  return { id: admin.id, name: admin.name, email: admin.email, role: admin.role };
}
