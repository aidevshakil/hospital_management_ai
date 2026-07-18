'use client';

import { useState, useTransition } from 'react';
import Modal from '../../../components/Admin/Modal';
import styles from '../adminPages.module.css';
import { createAppointment, updateAppointment, cancelAppointment } from './actions';

export interface AppointmentRow {
  dbId: string;
  id: string; // display code
  patient: string;
  email: string;
  phone: string;
  address: string;
  doctor: string;
  displayDate: string;
  isoDate: string;
  time: string;
  status: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled';
}

const STATUS_CLASS: Record<AppointmentRow['status'], string> = {
  Confirmed: styles.statusConfirmed,
  Pending: styles.statusPending,
  Completed: styles.statusCompleted,
  Cancelled: styles.statusCancelled,
};

const EMPTY_FORM = {
  patient: '',
  email: '',
  phone: '',
  address: '',
  doctor: '',
  date: '',
  time: '',
  status: 'Pending' as AppointmentRow['status'],
};

type ModalMode = 'new' | 'view' | 'edit' | null;

export default function AppointmentsClient({
  appointments,
  doctorNames,
}: {
  appointments: AppointmentRow[];
  doctorNames: string[];
}) {
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selected, setSelected] = useState<AppointmentRow | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showDoctorSuggestions, setShowDoctorSuggestions] = useState(false);
  const [isPending, startTransition] = useTransition();

  function openNew() {
    setForm(EMPTY_FORM);
    setSelected(null);
    setModalMode('new');
  }

  function openView(appointment: AppointmentRow) {
    setSelected(appointment);
    setModalMode('view');
  }

  function openEdit(appointment: AppointmentRow) {
    setSelected(appointment);
    setForm({
      patient: appointment.patient,
      email: appointment.email === '—' ? '' : appointment.email,
      phone: appointment.phone === '—' ? '' : appointment.phone,
      address: appointment.address === '—' ? '' : appointment.address,
      doctor: appointment.doctor === '—' ? '' : appointment.doctor,
      date: appointment.isoDate,
      time: appointment.time === '—' ? '' : appointment.time,
      status: appointment.status,
    });
    setModalMode('edit');
  }

  function closeModal() {
    setModalMode(null);
    setSelected(null);
  }

  function handleFormChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...form };
    startTransition(async () => {
      if (modalMode === 'edit' && selected) {
        await updateAppointment(selected.dbId, payload);
      } else {
        await createAppointment(payload);
      }
      closeModal();
    });
  }

  function handleCancel(dbId: string) {
    startTransition(() => cancelAppointment(dbId));
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Appointments</h1>
          <p className={styles.pageDescription}>Manage all patient appointments.</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ New Appointment</button>
      </div>

      <div className={styles.card}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Patient Name</th>
                <th>Doctor</th>
                <th>Date &amp; Time</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    No appointments yet.
                  </td>
                </tr>
              ) : (
                appointments.map((appointment) => (
                  <tr key={appointment.dbId}>
                    <td>{appointment.id}</td>
                    <td>{appointment.patient}</td>
                    <td>{appointment.doctor}</td>
                    <td>{appointment.displayDate}{appointment.time !== '—' ? ` - ${appointment.time}` : ''}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${STATUS_CLASS[appointment.status]}`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionGroup}>
                        <button className="btn btn-outline" style={{ padding: '4px 12px', fontSize: '0.8rem' }} onClick={() => openView(appointment)}>
                          View
                        </button>
                        <button className="btn btn-outline" style={{ padding: '4px 12px', fontSize: '0.8rem' }} onClick={() => openEdit(appointment)}>
                          Edit
                        </button>
                        <button
                          className="btn btn-outline"
                          style={{ padding: '4px 12px', fontSize: '0.8rem', color: '#991b1b', borderColor: '#991b1b' }}
                          onClick={() => handleCancel(appointment.dbId)}
                          disabled={appointment.status === 'Cancelled' || isPending}
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalMode === 'view' && selected && (
        <Modal title={`Appointment ${selected.id}`} onClose={closeModal}>
          <div className={styles.detailRow}><span className={styles.detailLabel}>Patient</span><span className={styles.detailValue}>{selected.patient}</span></div>
          <div className={styles.detailRow}><span className={styles.detailLabel}>Email</span><span className={styles.detailValue}>{selected.email}</span></div>
          <div className={styles.detailRow}><span className={styles.detailLabel}>Phone</span><span className={styles.detailValue}>{selected.phone}</span></div>
          <div className={styles.detailRow}><span className={styles.detailLabel}>Address</span><span className={styles.detailValue}>{selected.address}</span></div>
          <div className={styles.detailRow}><span className={styles.detailLabel}>Doctor</span><span className={styles.detailValue}>{selected.doctor}</span></div>
          <div className={styles.detailRow}><span className={styles.detailLabel}>Date</span><span className={styles.detailValue}>{selected.displayDate}</span></div>
          <div className={styles.detailRow}><span className={styles.detailLabel}>Time</span><span className={styles.detailValue}>{selected.time}</span></div>
          <div className={styles.detailRow}><span className={styles.detailLabel}>Status</span><span className={styles.detailValue}>{selected.status}</span></div>
        </Modal>
      )}

      {(modalMode === 'new' || modalMode === 'edit') && (
        <Modal title={modalMode === 'edit' ? `Edit Appointment ${selected?.id ?? ''}` : 'New Appointment'} onClose={closeModal}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="patient">Patient Name</label>
                <input id="patient" name="patient" value={form.patient} onChange={handleFormChange} required />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="phone">Phone Number</label>
                <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleFormChange} required />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" placeholder="patient@example.com" value={form.email} onChange={handleFormChange} />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="address">Address</label>
              <textarea id="address" name="address" rows={2} value={form.address} onChange={handleFormChange} />
            </div>
            <div className={styles.formGroup} style={{ position: 'relative' }}>
              <label htmlFor="doctor">Doctor</label>
              <input
                id="doctor"
                name="doctor"
                value={form.doctor}
                onChange={(e) => { handleFormChange(e); setShowDoctorSuggestions(true); }}
                onFocus={() => setShowDoctorSuggestions(true)}
                onBlur={() => setTimeout(() => setShowDoctorSuggestions(false), 200)}
                autoComplete="off"
              />
              {showDoctorSuggestions && form.doctor && (
                <ul className={styles.suggestionsList}>
                  {doctorNames.filter((doc) => doc.toLowerCase().includes(form.doctor.toLowerCase())).length > 0 ? (
                    doctorNames
                      .filter((doc) => doc.toLowerCase().includes(form.doctor.toLowerCase()))
                      .map((doc) => (
                        <li
                          key={doc}
                          className={styles.suggestionItem}
                          onClick={() => { setForm((prev) => ({ ...prev, doctor: doc })); setShowDoctorSuggestions(false); }}
                        >
                          {doc}
                        </li>
                      ))
                  ) : (
                    <li className={styles.suggestionItem} style={{ color: 'var(--text-muted)', cursor: 'default' }}>No doctors found</li>
                  )}
                </ul>
              )}
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="date">Date</label>
                <input id="date" name="date" type="date" value={form.date} onChange={handleFormChange} required />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="time">Time</label>
                <input id="time" name="time" type="time" value={form.time} onChange={handleFormChange} />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="status">Status</label>
              <select id="status" name="status" value={form.status} onChange={handleFormChange}>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div className={styles.formActions}>
              <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={isPending}>
                {isPending ? 'Saving…' : modalMode === 'edit' ? 'Save Changes' : 'Create Appointment'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
