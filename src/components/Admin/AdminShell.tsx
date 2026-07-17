'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import AdminSidebar from './AdminSidebar';
import AdminHeader, { AdminInfo } from './AdminHeader';
import styles from '../../app/admin/layout.module.css';

export default function AdminShell({ children, admin }: { children: React.ReactNode; admin: AdminInfo }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className={styles.adminLayout}>
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && (
        <div className={styles.sidebarOverlay} onClick={() => setSidebarOpen(false)} />
      )}
      <div className={styles.mainWrapper}>
        <AdminHeader onMenuClick={() => setSidebarOpen((prev) => !prev)} admin={admin} />
        <main className={styles.mainContent}>
          {children}
        </main>
      </div>
    </div>
  );
}
