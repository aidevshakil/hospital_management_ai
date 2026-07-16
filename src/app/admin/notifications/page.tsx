'use client';

import { useState } from 'react';
import styles from '../adminPages.module.css';

interface Notification {
  id: string;
  message: string;
  time: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: '#NTF-1', message: 'New appointment booked with Dr. John Doe 1.', time: '10 minutes ago', read: false },
  { id: '#NTF-2', message: 'New patient Jane Smith 3 registered.', time: '1 hour ago', read: false },
  { id: '#NTF-3', message: 'Appointment #APT-1002 was cancelled.', time: '3 hours ago', read: false },
  { id: '#NTF-4', message: 'Dr. John Doe 2 updated their availability.', time: 'Yesterday', read: true },
  { id: '#NTF-5', message: 'Monthly patient report is ready to download.', time: '2 days ago', read: true },
];

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  function markAsRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  function markAllAsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Notifications</h1>
          <p className={styles.pageDescription}>
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}.` : 'You are all caught up.'}
          </p>
        </div>
        <button className="btn btn-outline" onClick={markAllAsRead} disabled={unreadCount === 0}>
          Mark all as read
        </button>
      </div>

      <div className={styles.card}>
        <div className={styles.activityFeed}>
          {notifications.map((notification) => (
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
                  onClick={() => markAsRead(notification.id)}
                >
                  Mark as read
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
