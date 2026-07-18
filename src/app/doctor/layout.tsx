import { getCurrentDoctor } from '@/lib/auth';
import DoctorHeader from './DoctorHeader';
import styles from './doctor.module.css';

export default async function DoctorLayout({ children }: { children: React.ReactNode }) {
  const doctor = await getCurrentDoctor();

  // /doctor/login (allowed through by middleware) renders bare, with no chrome.
  if (!doctor) {
    return <>{children}</>;
  }

  return (
    <div className={styles.shell}>
      <DoctorHeader name={doctor.name} department={doctor.department} />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
