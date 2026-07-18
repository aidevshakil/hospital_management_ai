'use server';

import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { doctorCode } from '@/lib/codes';
import type { DoctorStatus } from '@prisma/client';

export interface DoctorFormInput {
  name: string;
  specialty: string; // department name
  experience: string;
  education: string;
  available: string; // availableDays
  image: string;
  status: string; // 'Active' | 'Inactive'
  email?: string; // login email for the doctor portal
  password?: string; // new password (blank = leave unchanged)
}

function toStatus(label: string): DoctorStatus {
  return label.toUpperCase() as DoctorStatus;
}

async function resolveDepartmentId(name: string): Promise<string | null> {
  if (!name) return null;
  const dept = await prisma.department.findUnique({ where: { name } });
  return dept?.id ?? null;
}

export async function createDoctor(input: DoctorFormInput) {
  const departmentId = await resolveDepartmentId(input.specialty);
  const email = input.email?.trim().toLowerCase() || null;
  const password = input.password?.trim()
    ? await bcrypt.hash(input.password.trim(), 10)
    : null;

  const created = await prisma.doctor.create({
    data: {
      name: input.name,
      email,
      password,
      experience: input.experience || null,
      education: input.education || null,
      availableDays: input.available || null,
      image: input.image || null,
      status: toStatus(input.status),
      departmentId,
    },
  });
  await prisma.doctor.update({ where: { id: created.id }, data: { code: doctorCode(created.seq) } });

  revalidatePath('/admin/doctors');
  revalidatePath('/doctors');
  revalidatePath('/admin');
}

export async function updateDoctor(id: string, input: DoctorFormInput) {
  const departmentId = await resolveDepartmentId(input.specialty);
  const email = input.email?.trim().toLowerCase() || null;

  await prisma.doctor.update({
    where: { id },
    data: {
      name: input.name,
      email,
      // Only overwrite the password when a new one is supplied.
      ...(input.password?.trim() ? { password: await bcrypt.hash(input.password.trim(), 10) } : {}),
      experience: input.experience || null,
      education: input.education || null,
      availableDays: input.available || null,
      image: input.image || null,
      status: toStatus(input.status),
      departmentId,
    },
  });

  revalidatePath('/admin/doctors');
  revalidatePath('/doctors');
  revalidatePath('/admin');
}
