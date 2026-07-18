'use server';

import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { setAdminSessionCookie, clearAdminSessionCookie } from '@/lib/session';

export interface AdminAuthResult {
  success: boolean;
  error?: string;
}

export async function loginAdmin(email: string, password: string): Promise<AdminAuthResult> {
  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail || !password) {
    return { success: false, error: 'Please enter your email and password.' };
  }

  const admin = await prisma.admin.findUnique({ where: { email: normalizedEmail } });
  if (!admin) {
    return { success: false, error: 'Invalid email or password.' };
  }

  const ok = await bcrypt.compare(password, admin.password);
  if (!ok) {
    return { success: false, error: 'Invalid email or password.' };
  }

  await setAdminSessionCookie(admin.id);
  return { success: true };
}

export async function logoutAdmin(): Promise<void> {
  await clearAdminSessionCookie();
}
