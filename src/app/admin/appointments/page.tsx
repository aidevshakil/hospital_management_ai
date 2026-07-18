import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/format';
import AppointmentsClient, { AppointmentRow } from './AppointmentsClient';

const STATUS_LABEL: Record<string, AppointmentRow['status']> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export default async function AdminAppointments() {
  const [appointments, doctors] = await Promise.all([
    prisma.appointment.findMany({
      orderBy: { date: 'desc' },
      include: { doctor: true },
    }),
    prisma.doctor.findMany({ orderBy: { name: 'asc' } }),
  ]);

  const rows: AppointmentRow[] = appointments.map((a) => ({
    dbId: a.id,
    id: a.code ?? a.id,
    patient: a.patientName,
    email: a.patientEmail ?? '—',
    phone: a.patientPhone ?? '—',
    address: a.patientAddress ?? '—',
    doctor: a.doctor?.name ?? '—',
    displayDate: formatDate(a.date),
    isoDate: a.date.toISOString().slice(0, 10),
    time: a.time ?? '—',
    status: STATUS_LABEL[a.status] ?? 'Pending',
  }));

  const doctorNames = doctors.map((d) => d.name);

  return <AppointmentsClient appointments={rows} doctorNames={doctorNames} />;
}
