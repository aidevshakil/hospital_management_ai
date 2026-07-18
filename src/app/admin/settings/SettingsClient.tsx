'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../adminPages.module.css';
import { updateAdminProfile, changeAdminPassword, updateAdminPreferences } from './actions';

export interface AdminSettings {
  name: string;
  email: string;
  phone: string;
  role: string;
  emailAlerts: boolean;
  smsAlerts: boolean;
}

const EMPTY_SECURITY = { currentPassword: '', newPassword: '', confirmPassword: '' };

export default function SettingsClient({ admin }: { admin: AdminSettings }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [profile, setProfile] = useState({ name: admin.name, email: admin.email, phone: admin.phone });
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [security, setSecurity] = useState(EMPTY_SECURITY);
  const [securityMsg, setSecurityMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [emailAlerts, setEmailAlerts] = useState(admin.emailAlerts);
  const [smsAlerts, setSmsAlerts] = useState(admin.smsAlerts);

  function handleProfileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    setProfileMsg(null);
  }

  function handleSecurityChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setSecurity((prev) => ({ ...prev, [name]: value }));
    setSecurityMsg(null);
  }

  function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProfileMsg(null);
    startTransition(async () => {
      const res = await updateAdminProfile(profile);
      if (res.ok) {
        setProfileMsg({ ok: true, text: 'Profile updated.' });
        router.refresh();
      } else {
        setProfileMsg({ ok: false, text: res.error ?? 'Could not save.' });
      }
    });
  }

  function handleSecuritySubmit(e: React.FormEvent) {
    e.preventDefault();
    setSecurityMsg(null);
    if (security.newPassword !== security.confirmPassword) {
      setSecurityMsg({ ok: false, text: 'New passwords do not match.' });
      return;
    }
    startTransition(async () => {
      const res = await changeAdminPassword(security.currentPassword, security.newPassword);
      if (res.ok) {
        setSecurity(EMPTY_SECURITY);
        setSecurityMsg({ ok: true, text: 'Password updated.' });
      } else {
        setSecurityMsg({ ok: false, text: res.error ?? 'Could not update password.' });
      }
    });
  }

  function togglePreference(key: 'emailAlerts' | 'smsAlerts') {
    const nextEmail = key === 'emailAlerts' ? !emailAlerts : emailAlerts;
    const nextSms = key === 'smsAlerts' ? !smsAlerts : smsAlerts;
    setEmailAlerts(nextEmail);
    setSmsAlerts(nextSms);
    startTransition(async () => {
      await updateAdminPreferences({ emailAlerts: nextEmail, smsAlerts: nextSms });
    });
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Profile & Settings</h1>
          <p className={styles.pageDescription}>Manage your admin account details and preferences.</p>
        </div>
      </div>

      <div className={styles.dashboardGrid}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Profile</h2>
          <form className={styles.form} onSubmit={handleProfileSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Full Name</label>
              <input id="name" name="name" value={profile.name} onChange={handleProfileChange} required />
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" value={profile.email} onChange={handleProfileChange} required />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="phone">Phone</label>
                <input id="phone" name="phone" type="tel" value={profile.phone} onChange={handleProfileChange} />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="role">Role</label>
              <input id="role" name="role" value={admin.role} disabled />
            </div>
            <div className={styles.formActions}>
              {profileMsg && (
                <span
                  className={styles.detailValue}
                  style={{ marginRight: 'auto', color: profileMsg.ok ? '#166534' : '#dc2626' }}
                >
                  {profileMsg.text}
                </span>
              )}
              <button type="submit" className="btn btn-primary" disabled={pending}>Save Profile</button>
            </div>
          </form>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Notification Preferences</h2>
          <div className={styles.activityFeed}>
            <div className={styles.activityItem}>
              <div className={styles.activityContent} style={{ flex: 1 }}>
                <p>Email Alerts</p>
                <span className={styles.activityTime}>Receive updates about appointments and patients by email.</span>
              </div>
              <button className="btn btn-outline" onClick={() => togglePreference('emailAlerts')} disabled={pending}>
                {emailAlerts ? 'On' : 'Off'}
              </button>
            </div>
            <div className={styles.activityItem}>
              <div className={styles.activityContent} style={{ flex: 1 }}>
                <p>SMS Alerts</p>
                <span className={styles.activityTime}>Receive urgent alerts by text message.</span>
              </div>
              <button className="btn btn-outline" onClick={() => togglePreference('smsAlerts')} disabled={pending}>
                {smsAlerts ? 'On' : 'Off'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.card} style={{ marginTop: 'var(--space-6)' }}>
        <h2 className={styles.cardTitle}>Change Password</h2>
        <form className={styles.form} onSubmit={handleSecuritySubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="currentPassword">Current Password</label>
            <input id="currentPassword" name="currentPassword" type="password" value={security.currentPassword} onChange={handleSecurityChange} required />
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="newPassword">New Password</label>
              <input id="newPassword" name="newPassword" type="password" value={security.newPassword} onChange={handleSecurityChange} required minLength={6} />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input id="confirmPassword" name="confirmPassword" type="password" value={security.confirmPassword} onChange={handleSecurityChange} required minLength={6} />
            </div>
          </div>
          <div className={styles.formActions}>
            {securityMsg && (
              <span
                className={styles.detailValue}
                style={{ marginRight: 'auto', color: securityMsg.ok ? '#166534' : '#dc2626' }}
              >
                {securityMsg.text}
              </span>
            )}
            <button type="submit" className="btn btn-primary" disabled={pending}>Update Password</button>
          </div>
        </form>
      </div>
    </div>
  );
}
