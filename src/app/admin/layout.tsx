import AdminSidebar from "../../components/Admin/AdminSidebar";
import AdminHeader from "../../components/Admin/AdminHeader";
import styles from './layout.module.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.adminLayout}>
      <AdminSidebar />
      <div className={styles.mainWrapper}>
        <AdminHeader />
        <main className={styles.mainContent}>
          {children}
        </main>
      </div>
    </div>
  );
}
