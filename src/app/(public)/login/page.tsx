'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePatientAuth } from '../../../context/PatientAuthContext';
import styles from '../auth.module.css';

export default function LoginPage() {
  const router = useRouter();
  const { login } = usePatientAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    setSubmitting(true);
    const result = await login(form.email, form.password);
    setSubmitting(false);

    if (!result.success) {
      setError(result.error ?? 'Invalid email or password.');
      return;
    }

    router.push('/appointment');
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.subtitle}>Log in to view and manage your appointments.</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" value={form.password} onChange={handleChange} required />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={submitting}>
            {submitting ? 'Logging in…' : 'Log In'}
          </button>
        </form>

        <p className={styles.footerNote}>
          Don&apos;t have an account? <Link href="/register">Register</Link>
        </p>
        <p className={styles.guestNote}>
          Just here to book a visit? <Link href="/appointment">Book as a guest</Link> — no account needed.
        </p>
      </div>
    </div>
  );
}
