import { prisma } from '@/lib/prisma';
import { formatRelative } from '@/lib/format';
import NotificationsClient, { NotificationItem } from './NotificationsClient';

export default async function AdminNotifications() {
  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const now = new Date();
  const data: NotificationItem[] = notifications.map((n) => ({
    id: n.id,
    message: n.message,
    time: formatRelative(n.createdAt, now),
    read: n.read,
  }));

  return <NotificationsClient notifications={data} />;
}
