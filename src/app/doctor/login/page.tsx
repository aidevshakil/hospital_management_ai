'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginDoctor } from '../auth-actions';

function DoctorLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/doctor';

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
    const result = await loginDoctor(form.email, form.password);
    setSubmitting(false);
    if (!result.success) {
      setError(result.error ?? 'Invalid email or password.');
      return;
    }
    router.replace(from.startsWith('/doctor') ? from : '/doctor');
    router.refresh();
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--background, #f8fafc)',
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          background: 'var(--surface, #fff)',
          borderRadius: 16,
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          padding: '2.5rem 2rem',
        }}
      >
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>
          Hospital<span style={{ color: 'var(--primary, #2563eb)' }}>AI</span> Doctor
        </h1>
        <p style={{ color: 'var(--text-muted, #64748b)', marginBottom: '1.5rem' }}>
          Sign in to view your appointments.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.12)', color: '#b91c1c', padding: '0.6rem 0.8rem', borderRadius: 8, fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label htmlFor="email" style={{ fontWeight: 600, fontSize: '0.9rem' }}>Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              style={{ padding: '0.6rem 0.75rem', border: '1px solid var(--border, #e2e8f0)', borderRadius: 8 }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label htmlFor="password" style={{ fontWeight: 600, fontSize: '0.9rem' }}>Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              style={{ padding: '0.6rem 0.75rem', border: '1px solid var(--border, #e2e8f0)', borderRadius: 8 }}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function DoctorLoginPage() {
  return (
    <Suspense fallback={null}>
      <DoctorLoginForm />
    </Suspense>
  );
}
