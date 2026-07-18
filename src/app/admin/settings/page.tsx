import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSessionAdminId } from '@/lib/session';
import SettingsClient from './SettingsClient';

export default async function AdminSettings() {
  const adminId = await getSessionAdminId();
  if (!adminId) redirect('/admin/login');

  const admin = await prisma.admin.findUnique({ where: { id: adminId } });
  if (!admin) redirect('/admin/login');

  return (
    <SettingsClient
      admin={{
        name: admin.name,
        email: admin.email,
        phone: admin.phone ?? '',
        role: admin.role,
        emailAlerts: admin.emailAlerts,
        smsAlerts: admin.smsAlerts,
      }}
    />
  );
}
