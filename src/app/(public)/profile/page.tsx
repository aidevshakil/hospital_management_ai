import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSessionPatientId } from '@/lib/session';
import { formatDate } from '@/lib/format';
import styles from './profile.module.css';
import UpcomingAppointments, { ApptDTO } from './UpcomingAppointments';
import DocumentsCard, { DocDTO } from './DocumentsCard';
import AccountSettings from './AccountSettings';

export const metadata = {
  title: 'My Profile',
};

const SLOT_LABEL: Record<string, string> = {
  MORNING: 'Morning (9:00 AM – 12:00 PM)',
  AFTERNOON: 'Afternoon (1:00 PM – 4:00 PM)',
  EVENING: 'Evening (5:00 PM – 8:00 PM)',
};

function statusClass(status: string): string {
  switch (status) {
    case 'CONFIRMED':
      return styles.statusConfirmed;
    case 'COMPLETED':
      return styles.statusCompleted;
    case 'CANCELLED':
      return styles.statusCancelled;
    default:
      return styles.statusPending;
  }
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
}

export default async function ProfilePage() {
  const patientId = await getSessionPatientId();
  if (!patientId) {
    redirect('/login?from=/profile');
  }

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      appointments: {
        include: { doctor: true, department: true },
        orderBy: { date: 'desc' },
      },
      documents: { orderBy: { uploadedAt: 'desc' } },
      medicalHistory: { orderBy: { recordedAt: 'desc' } },
    },
  });

  if (!patient) {
    redirect('/login?from=/profile');
  }

  const now = new Date();
  const upcomingRows = patient.appointments.filter(
    (a) => a.date >= now && a.status !== 'CANCELLED' && a.status !== 'COMPLETED',
  );
  const pastRows = patient.appointments.filter((a) => !upcomingRows.includes(a));

  const upcoming: ApptDTO[] = upcomingRows.map((a) => ({
    id: a.id,
    dateISO: a.date.toISOString(),
    day: a.date.getDate(),
    month: a.date.toLocaleDateString('en-US', { month: 'short' }),
    doctor: a.doctor?.name ?? 'Doctor to be assigned',
    department: a.department?.name ?? 'General',
    whenLabel: a.time ?? (a.slot ? SLOT_LABEL[a.slot] ?? a.slot : ''),
    symptoms: a.symptoms,
    status: a.status,
  }));

  const documents: DocDTO[] = patient.documents.map((d) => ({
    id: d.id,
    name: d.name,
    type: d.type,
    url: d.url,
    uploadedLabel: formatDate(d.uploadedAt),
  }));

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className="container">
          <div className={styles.headerInner}>
            <div className={styles.avatar}>{initials(patient.name) || '👤'}</div>
            <div>
              <h1 className={styles.name}>{patient.name}</h1>
              <p className={styles.subLine}>
                {patient.code && <span className={styles.code}>{patient.code}</span>}
                <span>Member since {formatDate(patient.createdAt)}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={`container ${styles.content}`}>
        {/* Stat summary */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{patient.appointments.length}</span>
            <span className={styles.statLabel}>Total Appointments</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{upcoming.length}</span>
            <span className={styles.statLabel}>Upcoming</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{patient.documents.length}</span>
            <span className={styles.statLabel}>Documents</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{formatDate(patient.lastVisit, '—')}</span>
            <span className={styles.statLabel}>Last Visit</span>
          </div>
        </div>

        <div className={styles.grid}>
          {/* Left column */}
          <div className={styles.colMain}>
            <UpcomingAppointments appointments={upcoming} />

            {/* Appointment history */}
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Appointment History</h2>
              {pastRows.length === 0 ? (
                <p className={styles.empty}>No past appointments yet.</p>
              ) : (
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Doctor</th>
                        <th>Department</th>
                        <th>Time</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pastRows.map((a) => (
                        <tr key={a.id}>
                          <td>{formatDate(a.date)}</td>
                          <td>{a.doctor?.name ?? '—'}</td>
                          <td>{a.department?.name ?? 'General'}</td>
                          <td>{a.time ?? (a.slot ? a.slot[0] + a.slot.slice(1).toLowerCase() : '—')}</td>
                          <td>
                            <span className={`${styles.status} ${statusClass(a.status)}`}>{a.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Medical history */}
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Medical History</h2>
              {patient.medicalHistory.length === 0 ? (
                <p className={styles.empty}>No medical history on record.</p>
              ) : (
                <ul className={styles.timeline}>
                  {patient.medicalHistory.map((m) => (
                    <li key={m.id} className={styles.timelineItem}>
                      <span className={styles.timelineDot} aria-hidden />
                      <div>
                        <p className={styles.timelineText}>{m.description}</p>
                        <p className={styles.timelineDate}>{formatDate(m.recordedAt)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {/* Right column */}
          <div className={styles.colSide}>
            <DocumentsCard documents={documents} />
            <AccountSettings
              profile={{
                name: patient.name,
                email: patient.email,
                phone: patient.phone ?? '',
                address: patient.address ?? '',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
