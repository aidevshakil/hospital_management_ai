'use server';

import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { setDoctorSessionCookie, clearDoctorSessionCookie } from '@/lib/session';
import { rateLimit, clientIp } from '@/lib/rate-limit';

export interface DoctorAuthResult {
  success: boolean;
  error?: string;
}

export async function loginDoctor(email: string, password: string): Promise<DoctorAuthResult> {
  const normalizedEmail = email?.trim().toLowerCase();

  const ip = await clientIp();
  if (!rateLimit(`doctor-login:${ip}`, 10, 15 * 60 * 1000).ok) {
    return { success: false, error: 'Too many login attempts. Please try again in a few minutes.' };
  }

  if (!normalizedEmail || !password) {
    return { success: false, error: 'Please enter your email and password.' };
  }

  const doctor = await prisma.doctor.findUnique({ where: { email: normalizedEmail } });
  if (!doctor || !doctor.password) {
    return { success: false, error: 'Invalid email or password.' };
  }
  if (doctor.status !== 'ACTIVE') {
    return { success: false, error: 'This account is inactive. Please contact the administrator.' };
  }

  const ok = await bcrypt.compare(password, doctor.password);
  if (!ok) {
    return { success: false, error: 'Invalid email or password.' };
  }

  await setDoctorSessionCookie(doctor.id);
  return { success: true };
}

export async function logoutDoctor(): Promise<void> {
  await clearDoctorSessionCookie();
}
