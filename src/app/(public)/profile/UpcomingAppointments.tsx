'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cancelMyAppointment, rescheduleMyAppointment } from './actions';
import styles from './profile.module.css';

export interface ApptDTO {
  id: string;
  dateISO: string;
  day: number;
  month: string;
  doctor: string;
  department: string;
  whenLabel: string;
  symptoms: string | null;
  status: string;
}

const SLOTS = [
  { value: 'MORNING', label: 'Morning (9:00 AM – 12:00 PM)' },
  { value: 'AFTERNOON', label: 'Afternoon (1:00 PM – 4:00 PM)' },
  { value: 'EVENING', label: 'Evening (5:00 PM – 8:00 PM)' },
];

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

export default function UpcomingAppointments({ appointments }: { appointments: ApptDTO[] }) {
  return (
    <section className={styles.card}>
      <div className={styles.cardHead}>
        <h2 className={styles.cardTitle}>Upcoming Appointments</h2>
        <Link href="/appointment" className="btn btn-primary">Book New</Link>
      </div>
      {appointments.length === 0 ? (
        <p className={styles.empty}>No upcoming appointments.</p>
      ) : (
        <ul className={styles.apptList}>
          {appointments.map((a) => (
            <AppointmentCard key={a.id} appt={a} />
          ))}
        </ul>
      )}
    </section>
  );
}

function AppointmentCard({ appt }: { appt: ApptDTO }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [date, setDate] = useState(appt.dateISO.slice(0, 10));
  const [slot, setSlot] = useState('MORNING');

  const todayISO = new Date().toISOString().slice(0, 10);

  function handleCancel() {
    if (!confirm('Cancel this appointment?')) return;
    setError('');
    startTransition(async () => {
      const res = await cancelMyAppointment(appt.id);
      if (!res.ok) setError(res.error ?? 'Could not cancel.');
      else router.refresh();
    });
  }

  function handleReschedule(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    startTransition(async () => {
      const res = await rescheduleMyAppointment(appt.id, date, slot);
      if (!res.ok) {
        setError(res.error ?? 'Could not reschedule.');
      } else {
        setEditing(false);
        router.refresh();
      }
    });
  }

  return (
    <li className={styles.apptItem}>
      <div className={styles.apptDate}>
        <span className={styles.apptDay}>{appt.day}</span>
        <span className={styles.apptMonth}>{appt.month}</span>
      </div>
      <div className={styles.apptBody}>
        <p className={styles.apptDoctor}>{appt.doctor}</p>
        <p className={styles.apptMeta}>
          {appt.department}
          {appt.whenLabel ? ` · ${appt.whenLabel}` : ''}
        </p>
        {appt.symptoms && <p className={styles.apptSymptoms}>“{appt.symptoms}”</p>}

        {editing ? (
          <form className={styles.rescheduleForm} onSubmit={handleReschedule}>
            <div className={styles.rescheduleFields}>
              <input
                type="date"
                value={date}
                min={todayISO}
                onChange={(e) => setDate(e.target.value)}
                required
              />
              <select value={slot} onChange={(e) => setSlot(e.target.value)}>
                {SLOTS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className={styles.apptActions}>
              <button type="submit" className="btn btn-primary" disabled={pending}>
                {pending ? 'Saving…' : 'Confirm change'}
              </button>
              <button
                type="button"
                className={styles.linkBtn}
                onClick={() => { setEditing(false); setError(''); }}
                disabled={pending}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className={styles.apptActions}>
            <button className={styles.linkBtn} onClick={() => setEditing(true)} disabled={pending}>
              Reschedule
            </button>
            <button className={styles.linkBtnDanger} onClick={handleCancel} disabled={pending}>
              Cancel
            </button>
          </div>
        )}
        {error && <p className={styles.inlineError}>{error}</p>}
      </div>
      <span className={`${styles.status} ${statusClass(appt.status)}`}>{appt.status}</span>
    </li>
  );
}
