'use client';

import { useTransition } from 'react';
import styles from '../adminPages.module.css';
import { markAsRead, markAllAsRead } from './actions';

export interface NotificationItem {
  id: string;
  message: string;
  time: string;
  read: boolean;
}

export default function NotificationsClient({ notifications }: { notifications: NotificationItem[] }) {
  const [isPending, startTransition] = useTransition();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Notifications</h1>
          <p className={styles.pageDescription}>
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}.`
              : 'You are all caught up.'}
          </p>
        </div>
        <button
          className="btn btn-outline"
          onClick={() => startTransition(() => markAllAsRead())}
          disabled={unreadCount === 0 || isPending}
        >
          Mark all as read
        </button>
      </div>

      <div className={styles.card}>
        <div className={styles.activityFeed}>
          {notifications.length === 0 ? (
            <p style={{ padding: '1rem', color: 'var(--text-muted)' }}>No notifications.</p>
          ) : (
            notifications.map((notification) => (
              <div key={notification.id} className={styles.activityItem}>
                <div
                  className={styles.activityDot}
                  style={{ background: notification.read ? 'var(--border)' : 'var(--primary)' }}
                />
                <div className={styles.activityContent} style={{ flex: 1 }}>
                  <p style={{ fontWeight: notification.read ? 400 : 700 }}>{notification.message}</p>
                  <span className={styles.activityTime}>{notification.time}</span>
                </div>
                {!notification.read && (
                  <button
                    className="btn btn-outline"
                    style={{ padding: '4px 12px', fontSize: '0.8rem', alignSelf: 'center' }}
                    onClick={() => startTransition(() => markAsRead(notification.id))}
                    disabled={isPending}
                  >
                    Mark as read
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
