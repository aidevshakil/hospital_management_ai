'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { logoutDoctor } from './auth-actions';
import styles from './doctor.module.css';

export default function DoctorHeader({ name, department }: { name: string; department: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      await logoutDoctor();
      router.replace('/doctor/login');
      router.refresh();
    });
  }

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <div className={styles.brand}>
          Hospital<span>AI</span> <span className={styles.brandTag}>Doctor</span>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.who}>
            <span className={styles.whoName}>{name}</span>
            <span className={styles.whoDept}>{department}</span>
          </div>
          <button className="btn btn-outline" onClick={handleLogout} disabled={pending}>
            {pending ? '…' : 'Logout'}
          </button>
        </div>
      </div>
    </header>
  );
}
