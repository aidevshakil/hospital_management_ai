'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import type { DoctorStatus } from '@prisma/client';

export interface DoctorFormInput {
  name: string;
  specialty: string; // department name
  experience: string;
  education: string;
  available: string; // availableDays
  image: string;
  status: string; // 'Active' | 'Inactive'
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
  const count = await prisma.doctor.count();

  await prisma.doctor.create({
    data: {
      code: `#DOC-${1000 + count + 1}`,
      name: input.name,
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

export async function updateDoctor(id: string, input: DoctorFormInput) {
  const departmentId = await resolveDepartmentId(input.specialty);

  await prisma.doctor.update({
    where: { id },
    data: {
      name: input.name,
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
