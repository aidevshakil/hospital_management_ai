'use client';

import { useState } from 'react';
import styles from '../adminPages.module.css';

const INITIAL_PROFILE = {
  name: 'Admin User',
  email: 'admin@hospital.com',
  phone: '+1 555-0100',
  role: 'Superadmin',
};

const INITIAL_SECURITY = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

const INITIAL_PREFERENCES = {
  emailAlerts: true,
  smsAlerts: false,
};

export default function AdminSettings() {
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [security, setSecurity] = useState(INITIAL_SECURITY);
  const [preferences, setPreferences] = useState(INITIAL_PREFERENCES);
  const [profileSaved, setProfileSaved] = useState(false);
  const [securitySaved, setSecuritySaved] = useState(false);

  function handleProfileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    setProfileSaved(false);
  }

  function handleSecurityChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setSecurity((prev) => ({ ...prev, [name]: value }));
    setSecuritySaved(false);
  }

  function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProfileSaved(true);
  }

  function handleSecuritySubmit(e: React.FormEvent) {
    e.preventDefault();
    setSecurity(INITIAL_SECURITY);
    setSecuritySaved(true);
  }

  function togglePreference(key: keyof typeof preferences) {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
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
                <input id="phone" name="phone" type="tel" value={profile.phone} onChange={handleProfileChange} required />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="role">Role</label>
              <input id="role" name="role" value={profile.role} disabled />
            </div>
            <div className={styles.formActions}>
              {profileSaved && <span className={styles.detailValue} style={{ marginRight: 'auto', color: '#166534' }}>Profile updated.</span>}
              <button type="submit" className="btn btn-primary">Save Profile</button>
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
              <button className="btn btn-outline" onClick={() => togglePreference('emailAlerts')}>
                {preferences.emailAlerts ? 'On' : 'Off'}
              </button>
            </div>
            <div className={styles.activityItem}>
              <div className={styles.activityContent} style={{ flex: 1 }}>
                <p>SMS Alerts</p>
                <span className={styles.activityTime}>Receive urgent alerts by text message.</span>
              </div>
              <button className="btn btn-outline" onClick={() => togglePreference('smsAlerts')}>
                {preferences.smsAlerts ? 'On' : 'Off'}
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
              <input id="newPassword" name="newPassword" type="password" value={security.newPassword} onChange={handleSecurityChange} required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input id="confirmPassword" name="confirmPassword" type="password" value={security.confirmPassword} onChange={handleSecurityChange} required />
            </div>
          </div>
          <div className={styles.formActions}>
            {securitySaved && <span className={styles.detailValue} style={{ marginRight: 'auto', color: '#166534' }}>Password updated.</span>}
            <button type="submit" className="btn btn-primary">Update Password</button>
          </div>
        </form>
      </div>
    </div>
  );
}
