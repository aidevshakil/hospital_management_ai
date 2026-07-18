'use server';

import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getSessionAdminId } from '@/lib/session';

export interface AdminSettingsResult {
  ok: boolean;
  error?: string;
}

export async function updateAdminProfile(input: {
  name: string;
  email: string;
  phone: string;
}): Promise<AdminSettingsResult> {
  const adminId = await getSessionAdminId();
  if (!adminId) return { ok: false, error: 'Please sign in.' };

  const name = input.name?.trim();
  const email = input.email?.trim().toLowerCase();
  if (!name || !email) return { ok: false, error: 'Name and email are required.' };

  // Guard against colliding with another admin's email.
  const clash = await prisma.admin.findFirst({ where: { email, id: { not: adminId } } });
  if (clash) return { ok: false, error: 'Another admin already uses that email.' };

  await prisma.admin.update({
    where: { id: adminId },
    data: { name, email, phone: input.phone?.trim() || null },
  });

  revalidatePath('/admin/settings');
  revalidatePath('/admin');
  return { ok: true };
}

export async function changeAdminPassword(
  currentPassword: string,
  newPassword: string,
): Promise<AdminSettingsResult> {
  const adminId = await getSessionAdminId();
  if (!adminId) return { ok: false, error: 'Please sign in.' };

  if (!newPassword || newPassword.length < 6) {
    return { ok: false, error: 'New password must be at least 6 characters.' };
  }

  const admin = await prisma.admin.findUnique({ where: { id: adminId } });
  if (!admin) return { ok: false, error: 'Account not found.' };

  const ok = await bcrypt.compare(currentPassword ?? '', admin.password);
  if (!ok) return { ok: false, error: 'Your current password is incorrect.' };

  await prisma.admin.update({
    where: { id: adminId },
    data: { password: await bcrypt.hash(newPassword, 10) },
  });

  return { ok: true };
}

export async function updateAdminPreferences(input: {
  emailAlerts: boolean;
  smsAlerts: boolean;
}): Promise<AdminSettingsResult> {
  const adminId = await getSessionAdminId();
  if (!adminId) return { ok: false, error: 'Please sign in.' };

  await prisma.admin.update({
    where: { id: adminId },
    data: { emailAlerts: input.emailAlerts, smsAlerts: input.smsAlerts },
  });

  revalidatePath('/admin/settings');
  return { ok: true };
}
