import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import styles from './appointment.module.css';
import AppointmentForm, { DoctorOption } from './AppointmentForm';

export default async function AppointmentPage({
  searchParams,
}: {
  searchParams: Promise<{ doctor?: string }>;
}) {
  const { doctor: initialDoctorId } = await searchParams;

  const [departments, doctors] = await Promise.all([
    prisma.department.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.doctor.findMany({
      where: { status: 'ACTIVE' },
      include: { department: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  const departmentNames = departments.map((d) => d.name);
  const doctorOptions: DoctorOption[] = doctors.map((doc) => ({
    id: doc.id,
    name: doc.name,
    department: doc.department?.name ?? 'General',
  }));

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className="container">
          <h1 className={styles.title}>Book an Appointment</h1>
          <p className={styles.subtitle}>Fill out the form below or use our AI assistant to find the right doctor.</p>
        </div>
      </div>

      <div className={`container ${styles.content}`}>
        <div className={styles.splitLayout}>
          <AppointmentForm
            departments={departmentNames}
            doctors={doctorOptions}
            initialDoctorId={initialDoctorId}
          />

          {/* AI Assistant Banner */}
          <div className={styles.aiBanner}>
            <div className={styles.aiIcon}>✨</div>
            <h3>Not sure which doctor to see?</h3>
            <p>Describe your symptoms to our AI Chatbot and it will suggest the best department and specialist for your needs.</p>
            <Link href="/ai-checker" className="btn btn-secondary" style={{ width: '100%', display: 'block', textAlign: 'center' }}>
              Try AI Symptom Checker
            </Link>

            <div className={styles.aiFeatures}>
              <ul>
                <li>✓ Instant Recommendations</li>
                <li>✓ 24/7 Availability</li>
                <li>✓ Privacy Protected</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
