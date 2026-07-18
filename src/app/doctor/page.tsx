import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSessionDoctorId } from '@/lib/session';
import { formatDate } from '@/lib/format';
import styles from './doctor.module.css';
import AppointmentRow, { DoctorApptDTO } from './AppointmentRow';

export const metadata = { title: 'Doctor Dashboard' };

const SLOT_LABEL: Record<string, string> = {
  MORNING: 'Morning',
  AFTERNOON: 'Afternoon',
  EVENING: 'Evening',
};

export default async function DoctorDashboard() {
  const doctorId = await getSessionDoctorId();
  if (!doctorId) redirect('/doctor/login');

  const appointments = await prisma.appointment.findMany({
    where: { doctorId },
    include: { department: true, patient: true },
    orderBy: { date: 'desc' },
  });

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const toDTO = (a: (typeof appointments)[number]): DoctorApptDTO => ({
    id: a.id,
    code: a.code ?? '',
    dateLabel: formatDate(a.date),
    whenLabel: a.time ?? (a.slot ? SLOT_LABEL[a.slot] ?? a.slot : '—'),
    patientName: a.patient?.name ?? a.patientName,
    patientPhone: a.patientPhone ?? a.patient?.phone ?? '',
    symptoms: a.symptoms ?? '',
    status: a.status,
  });

  const today = appointments.filter((a) => a.date >= todayStart && a.date < todayEnd).map(toDTO);
  const upcoming = appointments.filter((a) => a.date >= todayEnd).map(toDTO);
  const past = appointments.filter((a) => a.date < todayStart).map(toDTO);

  const pendingCount = appointments.filter((a) => a.status === 'PENDING').length;

  return (
    <div className="container">
      <h1 className={styles.pageTitle}>My Appointments</h1>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{today.length}</span>
          <span className={styles.statLabel}>Today</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{upcoming.length}</span>
          <span className={styles.statLabel}>Upcoming</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{pendingCount}</span>
          <span className={styles.statLabel}>Awaiting Confirmation</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{appointments.length}</span>
          <span className={styles.statLabel}>Total</span>
        </div>
      </div>

      <Section title="Today" items={today} emptyText="No appointments scheduled for today." />
      <Section title="Upcoming" items={upcoming} emptyText="No upcoming appointments." />
      <Section title="Past" items={past} emptyText="No past appointments." collapsedEmpty />
    </div>
  );
}

function Section({
  title,
  items,
  emptyText,
  collapsedEmpty,
}: {
  title: string;
  items: DoctorApptDTO[];
  emptyText: string;
  collapsedEmpty?: boolean;
}) {
  if (collapsedEmpty && items.length === 0) return null;
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>
        {title} <span className={styles.count}>{items.length}</span>
      </h2>
      {items.length === 0 ? (
        <p className={styles.empty}>{emptyText}</p>
      ) : (
        <ul className={styles.apptList}>
          {items.map((a) => (
            <AppointmentRow key={a.id} appt={a} />
          ))}
        </ul>
      )}
    </section>
  );
}
