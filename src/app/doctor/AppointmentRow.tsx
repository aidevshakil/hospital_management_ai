'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { setAppointmentStatus } from './actions';
import styles from './doctor.module.css';

export interface DoctorApptDTO {
  id: string;
  code: string;
  dateLabel: string;
  whenLabel: string;
  patientName: string;
  patientPhone: string;
  symptoms: string;
  status: string;
}

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

// Which actions make sense from each state.
const NEXT_ACTIONS: Record<string, { label: string; status: string; danger?: boolean }[]> = {
  PENDING: [
    { label: 'Confirm', status: 'CONFIRMED' },
    { label: 'Decline', status: 'CANCELLED', danger: true },
  ],
  CONFIRMED: [
    { label: 'Mark Completed', status: 'COMPLETED' },
    { label: 'Cancel', status: 'CANCELLED', danger: true },
  ],
  COMPLETED: [],
  CANCELLED: [{ label: 'Reopen', status: 'PENDING' }],
};

export default function AppointmentRow({ appt }: { appt: DoctorApptDTO }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');

  function act(status: string) {
    setError('');
    startTransition(async () => {
      const res = await setAppointmentStatus(appt.id, status);
      if (!res.ok) setError(res.error ?? 'Could not update.');
      else router.refresh();
    });
  }

  const actions = NEXT_ACTIONS[appt.status] ?? [];

  return (
    <li className={styles.apptItem}>
      <div className={styles.apptMain}>
        <div className={styles.apptTop}>
          <span className={styles.apptPatient}>{appt.patientName}</span>
          {appt.code && <span className={styles.apptCode}>{appt.code}</span>}
          <span className={`${styles.status} ${statusClass(appt.status)}`}>{appt.status}</span>
        </div>
        <p className={styles.apptMeta}>
          {appt.dateLabel} · {appt.whenLabel}
          {appt.patientPhone ? ` · ${appt.patientPhone}` : ''}
        </p>
        {appt.symptoms && <p className={styles.apptSymptoms}>“{appt.symptoms}”</p>}
        {error && <p className={styles.inlineError}>{error}</p>}
      </div>

      {actions.length > 0 && (
        <div className={styles.apptActions}>
          {actions.map((a) => (
            <button
              key={a.status}
              className={a.danger ? 'btn btn-outline' : 'btn btn-primary'}
              onClick={() => act(a.status)}
              disabled={pending}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
    </li>
  );
}
