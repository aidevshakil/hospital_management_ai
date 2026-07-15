'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Admin.module.css';

export default function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    { name: 'Dashboard', path: '/admin', icon: '📊' },
    { name: 'Appointments', path: '/admin/appointments', icon: '📅' },
    { name: 'Doctors', path: '/admin/doctors', icon: '👨‍⚕️' },
    { name: 'Patients', path: '/admin/patients', icon: '🧑‍🤝‍🧑' },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoText}>Hospital</span>
          <span className={styles.logoHighlight}>AI</span>
        </Link>
      </div>
      
      <nav className={styles.sidebarNav}>
        {links.map((link) => (
          <Link 
            key={link.path} 
            href={link.path}
            className={`${styles.navItem} ${pathname === link.path ? styles.active : ''}`}
          >
            <span className={styles.navIcon}>{link.icon}</span>
            <span className={styles.navText}>{link.name}</span>
          </Link>
        ))}
      </nav>

      <div className={styles.sidebarFooter}>
        <Link href="/" className={styles.navItem}>
          <span className={styles.navIcon}>🏠</span>
          <span className={styles.navText}>Back to Site</span>
        </Link>
      </div>
    </aside>
  );
}
