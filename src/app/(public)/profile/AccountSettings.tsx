'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateMyProfile, changeMyPassword } from './actions';
import styles from './profile.module.css';

export interface ProfileDTO {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export default function AccountSettings({ profile }: { profile: ProfileDTO }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  // Profile form
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const [address, setAddress] = useState(profile.address);
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Password form
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileMsg(null);
    startTransition(async () => {
      const res = await updateMyProfile({ name, phone, address });
      if (res.ok) {
        setProfileMsg({ ok: true, text: 'Profile updated.' });
        router.refresh();
      } else {
        setProfileMsg({ ok: false, text: res.error ?? 'Could not save.' });
      }
    });
  }

  function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg(null);
    if (next !== confirm) {
      setPwMsg({ ok: false, text: 'New passwords do not match.' });
      return;
    }
    startTransition(async () => {
      const res = await changeMyPassword(current, next);
      if (res.ok) {
        setPwMsg({ ok: true, text: 'Password changed.' });
        setCurrent(''); setNext(''); setConfirm('');
      } else {
        setPwMsg({ ok: false, text: res.error ?? 'Could not change password.' });
      }
    });
  }

  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>Account Settings</h2>

      <form className={styles.settingsForm} onSubmit={saveProfile}>
        <h3 className={styles.settingsSub}>Personal Information</h3>
        <label className={styles.field}>
          <span>Full Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label className={styles.field}>
          <span>Email</span>
          <input value={profile.email} disabled title="Email cannot be changed here" />
        </label>
        <label className={styles.field}>
          <span>Phone</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>
        <label className={styles.field}>
          <span>Address</span>
          <input value={address} onChange={(e) => setAddress(e.target.value)} />
        </label>
        <div className={styles.settingsFooter}>
          <button type="submit" className="btn btn-primary" disabled={pending}>Save Changes</button>
          {profileMsg && (
            <span className={profileMsg.ok ? styles.okMsg : styles.inlineError}>{profileMsg.text}</span>
          )}
        </div>
      </form>

      <hr className={styles.divider} />

      <form className={styles.settingsForm} onSubmit={savePassword}>
        <h3 className={styles.settingsSub}>Change Password</h3>
        <label className={styles.field}>
          <span>Current Password</span>
          <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required />
        </label>
        <label className={styles.field}>
          <span>New Password</span>
          <input type="password" value={next} onChange={(e) => setNext(e.target.value)} required minLength={6} />
        </label>
        <label className={styles.field}>
          <span>Confirm New Password</span>
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={6} />
        </label>
        <div className={styles.settingsFooter}>
          <button type="submit" className="btn btn-outline" disabled={pending}>Update Password</button>
          {pwMsg && (
            <span className={pwMsg.ok ? styles.okMsg : styles.inlineError}>{pwMsg.text}</span>
          )}
        </div>
      </form>
    </section>
  );
}
