'use server';

import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { setSessionCookie, clearSessionCookie } from '@/lib/session';
import { sendWelcomeEmail } from '@/lib/emails';
import { patientCode } from '@/lib/codes';
import { rateLimit, clientIp } from '@/lib/rate-limit';
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

/**
 * Attach any prior guest appointments (booked before the account existed) to
 * this patient by matching the email. Runs on register and login so a patient
 * always sees their full history on the profile.
 */
async function linkGuestAppointments(patientId: string, email: string): Promise<void> {
  await prisma.appointment
    .updateMany({
      where: { patientId: null, patientEmail: email },
      data: { patientId },
    })
    .catch(() => {});
}

export async function registerPatient(input: RegisterInput): Promise<AuthResult> {
  const name = input.name?.trim();
  const email = input.email?.trim().toLowerCase();
  const password = input.password ?? '';

  const ip = await clientIp();
  if (!rateLimit(`register:${ip}`, 5, 60 * 60 * 1000).ok) {
    return { success: false, error: 'Too many sign-up attempts. Please try again later.' };
  }

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

  // Create first (assigns the race-free `seq`), then derive the code from it.
  const created = await prisma.patient.create({
    data: {
      name,
      email,
      phone: input.phone?.trim() || null,
      address: input.address?.trim() || null,
      password: passwordHash,
    },
  });
  const patient = await prisma.patient.update({
    where: { id: created.id },
    data: { code: patientCode(created.seq) },
  });

  await linkGuestAppointments(patient.id, email);
  await setSessionCookie(patient.id);
  await sendWelcomeEmail({ name: patient.name, email: patient.email });
  return { success: true, patient: toPublic(patient) };
}

export async function loginPatient(email: string, password: string): Promise<AuthResult> {
  const normalizedEmail = email?.trim().toLowerCase();

  const ip = await clientIp();
  if (!rateLimit(`login:${ip}`, 10, 15 * 60 * 1000).ok) {
    return { success: false, error: 'Too many login attempts. Please try again in a few minutes.' };
  }

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

  await linkGuestAppointments(patient.id, patient.email);
  await setSessionCookie(patient.id);
  return { success: true, patient: toPublic(patient) };
}

export async function logoutPatient(): Promise<void> {
  await clearSessionCookie();
}
