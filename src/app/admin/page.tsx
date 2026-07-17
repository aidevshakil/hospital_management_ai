import StatCard from '../../components/Admin/StatCard';
import { prisma } from '@/lib/prisma';
import { formatRelative } from '@/lib/format';
import DownloadReportButton, { ReportStat, ReportAppointment } from './DownloadReportButton';
import styles from './adminPages.module.css';

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const STATUS_BADGE: Record<string, string> = {
  PENDING: styles.statusPending,
  CONFIRMED: styles.statusConfirmed,
  COMPLETED: styles.statusCompleted,
  CANCELLED: styles.statusCancelled,
};

export default async function AdminDashboard() {
  const [totalPatients, totalAppointments, activeDoctors, totalDepartments, recent, activity] =
    await Promise.all([
      prisma.patient.count(),
      prisma.appointment.count(),
      prisma.doctor.count({ where: { status: 'ACTIVE' } }),
      prisma.department.count(),
      prisma.appointment.findMany({
        orderBy: { date: 'desc' },
        take: 5,
        include: { doctor: { include: { department: true } } },
      }),
      prisma.notification.findMany({ orderBy: { createdAt: 'desc' }, take: 3 }),
    ]);

  const stats: ReportStat[] = [
    { title: 'Total Patients', value: String(totalPatients) },
    { title: 'Total Appointments', value: String(totalAppointments) },
    { title: 'Available Doctors', value: String(activeDoctors) },
    { title: 'Departments', value: String(totalDepartments) },
  ];

  const now = new Date();
  const recentForReport: ReportAppointment[] = recent.map((a) => ({
    patient: a.patientName,
    doctor: a.doctor ? `${a.doctor.name}${a.doctor.department ? ` (${a.doctor.department.name})` : ''}` : '—',
    time: a.time ?? '—',
    status: STATUS_LABEL[a.status] ?? a.status,
  }));

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Dashboard Overview</h1>
          <p className={styles.pageDescription}>Welcome back! Here&apos;s what&apos;s happening at Hospital AI today.</p>
        </div>
        <DownloadReportButton stats={stats} appointments={recentForReport} />
      </div>

      <div className={styles.statsGrid}>
        <StatCard title="Total Patients" value={totalPatients} icon="🧑‍🤝‍🧑" />
        <StatCard title="Total Appointments" value={totalAppointments} icon="📅" />
        <StatCard title="Available Doctors" value={activeDoctors} icon="👨‍⚕️" />
        <StatCard title="Departments" value={totalDepartments} icon="🏥" />
      </div>

      <div className={styles.dashboardGrid}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Recent Appointments</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Doctor</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      No appointments yet.
                    </td>
                  </tr>
                ) : (
                  recent.map((a) => (
                    <tr key={a.id}>
                      <td>{a.patientName}</td>
                      <td>
                        {a.doctor
                          ? `${a.doctor.name}${a.doctor.department ? ` (${a.doctor.department.name})` : ''}`
                          : '—'}
                      </td>
                      <td>{a.time ?? '—'}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${STATUS_BADGE[a.status] ?? ''}`}>
                          {STATUS_LABEL[a.status] ?? a.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>System Activity</h2>
          <div className={styles.activityFeed}>
            {activity.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No recent activity.</p>
            ) : (
              activity.map((n) => (
                <div key={n.id} className={styles.activityItem}>
                  <div className={styles.activityDot}></div>
                  <div className={styles.activityContent}>
                    <p>{n.message}</p>
                    <span className={styles.activityTime}>{formatRelative(n.createdAt, now)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
