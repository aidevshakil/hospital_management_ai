'use server';

import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { setSessionCookie, clearSessionCookie } from '@/lib/session';
import { sendWelcomeEmail } from '@/lib/emails';
import type { AuthResult, RegisterInput, PublicPatient } from '@/lib/auth-types';

function toPublic(p: {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
}): PublicPatient {
  return { id: p.id, name: p.name, email: p.email, phone: p.phone ?? '', address: p.address ?? '' };
}

export async function registerPatient(input: RegisterInput): Promise<AuthResult> {
  const name = input.name?.trim();
  const email = input.email?.trim().toLowerCase();
  const password = input.password ?? '';

  if (!name || !email || !password) {
    return { success: false, error: 'Name, email, and password are required.' };
  }
  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters.' };
  }

  const existing = await prisma.patient.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: 'An account with this email already exists.' };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const count = await prisma.patient.count();

  const patient = await prisma.patient.create({
    data: {
      code: `#PAT-${5000 + count + 1}`,
      name,
      email,
      phone: input.phone?.trim() || null,
      address: input.address?.trim() || null,
      password: passwordHash,
    },
  });

  await setSessionCookie(patient.id);
  await sendWelcomeEmail({ name: patient.name, email: patient.email });
  return { success: true, patient: toPublic(patient) };
}

export async function loginPatient(email: string, password: string): Promise<AuthResult> {
  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail || !password) {
    return { success: false, error: 'Please enter your email and password.' };
  }

  const patient = await prisma.patient.findUnique({ where: { email: normalizedEmail } });
  if (!patient) {
    return { success: false, error: 'Invalid email or password.' };
  }

  const ok = await bcrypt.compare(password, patient.password);
  if (!ok) {
    return { success: false, error: 'Invalid email or password.' };
  }

  await setSessionCookie(patient.id);
  return { success: true, patient: toPublic(patient) };
}

export async function logoutPatient(): Promise<void> {
  await clearSessionCookie();
}
