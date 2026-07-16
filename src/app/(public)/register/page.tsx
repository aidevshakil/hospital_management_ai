'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePatientAuth } from '../../../context/PatientAuthContext';
import styles from '../auth.module.css';

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  address: '',
  password: '',
  confirmPassword: '',
};

export default function RegisterPage() {
  const router = useRouter();
  const { register } = usePatientAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const result = register({
      name: form.name,
      email: form.email,
      phone: form.phone,
      address: form.address,
      password: form.password,
    });

    if (!result.success) {
      setError(result.error ?? 'Something went wrong. Please try again.');
      return;
    }

    router.push('/appointment');
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Create Your Account</h1>
        <p className={styles.subtitle}>Register to manage your appointments and medical details.</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.formGroup}>
            <label htmlFor="name">Full Name</label>
            <input id="name" name="name" value={form.name} onChange={handleChange} required />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="phone">Phone Number</label>
            <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} required />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="address">Address</label>
            <input id="address" name="address" value={form.address} onChange={handleChange} required />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" value={form.password} onChange={handleChange} required minLength={6} />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input id="confirmPassword" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} required minLength={6} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
            Create Account
          </button>
        </form>

        <p className={styles.footerNote}>
          Already have an account? <Link href="/login">Log in</Link>
        </p>
        <p className={styles.guestNote}>
          Just here to book a visit? <Link href="/appointment">Book as a guest</Link> — no account needed.
        </p>
      </div>
    </div>
  );
}
