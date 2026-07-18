import { prisma } from '@/lib/prisma';
import styles from './doctors.module.css';
import DoctorsClient, { DoctorCard } from './DoctorsClient';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80';

export default async function DoctorsPage() {
  const doctors = await prisma.doctor.findMany({
    where: { status: 'ACTIVE' },
    include: { department: true },
    orderBy: { code: 'asc' },
  });

  const cards: DoctorCard[] = doctors.map((doc) => ({
    id: doc.id,
    name: doc.name,
    specialty: doc.department?.name ?? 'General',
    experience: doc.experience ?? '—',
    education: doc.education ?? '—',
    available: doc.availableDays ?? '—',
    image: doc.image || FALLBACK_IMAGE,
  }));

  // Distinct specialties present among the listed doctors, for the filter.
  const specialties = [...new Set(cards.map((c) => c.specialty))].sort();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className="container">
          <h1 className={styles.title}>Our Medical Specialists</h1>
          <p className={styles.subtitle}>Find the right doctor for your healthcare needs.</p>
        </div>
      </div>

      <DoctorsClient doctors={cards} specialties={specialties} />
    </div>
  );
}
