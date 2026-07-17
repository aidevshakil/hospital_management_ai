'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function markAsRead(id: string) {
  await prisma.notification.update({ where: { id }, data: { read: true } });
  revalidatePath('/admin/notifications');
}

export async function markAllAsRead() {
  await prisma.notification.updateMany({ where: { read: false }, data: { read: true } });
  revalidatePath('/admin/notifications');
}
