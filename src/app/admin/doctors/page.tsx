import { prisma } from '@/lib/prisma';
import DoctorsClient, { DoctorRow } from './DoctorsClient';

export default async function AdminDoctors() {
  const [doctors, departments] = await Promise.all([
    prisma.doctor.findMany({ orderBy: { code: 'asc' }, include: { department: true } }),
    prisma.department.findMany({ orderBy: { createdAt: 'asc' } }),
  ]);

  const rows: DoctorRow[] = doctors.map((d) => ({
    dbId: d.id,
    id: d.code ?? d.id,
    name: d.name,
    specialty: d.department?.name ?? '—',
    experience: d.experience ?? '—',
    education: d.education ?? '—',
    available: d.availableDays ?? '—',
    image: d.image ?? '',
    status: d.status === 'ACTIVE' ? 'Active' : 'Inactive',
  }));

  const specialties = departments.map((dept) => dept.name);

  return <DoctorsClient doctors={rows} specialties={specialties} />;
}
