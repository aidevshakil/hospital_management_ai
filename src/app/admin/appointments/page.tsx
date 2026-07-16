'use client';

import { useState } from 'react';
import Modal from '../../../components/Admin/Modal';
import styles from '../adminPages.module.css';

interface Appointment {
  id: string;
  patient: string;
  phone: string;
  address: string;
  doctor: string;
  date: string;
  time: string;
  status: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled';
}

const INITIAL_APPOINTMENTS: Appointment[] = [1, 2, 3, 4, 5].map((item) => ({
  id: `#APT-${1000 + item}`,
  patient: `Patient ${item}`,
  phone: `+1 555-010${item}`,
  address: `${100 + item} Main St, Springfield`,
  doctor: 'Dr. Example',
  date: 'Oct 12, 2023',
  time: '09:00 AM',
  status: item % 2 === 0 ? 'Confirmed' : 'Pending',
}));

const STATUS_CLASS: Record<Appointment['status'], string> = {
  Confirmed: styles.statusConfirmed,
  Pending: styles.statusPending,
  Completed: styles.statusCompleted,
  Cancelled: styles.statusCancelled,
};

const EMPTY_FORM = {
  patient: '',
  phone: '',
  address: '',
  doctor: '',
  date: '',
  time: '',
  status: 'Pending' as Appointment['status'],
};

type ModalMode = 'new' | 'view' | 'edit' | null;

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  function openNew() {
    setForm(EMPTY_FORM);
    setModalMode('new');
  }

  function openView(appointment: Appointment) {
    setSelected(appointment);
    setModalMode('view');
  }

  function openEdit(appointment: Appointment) {
    setSelected(appointment);
    setForm({
      patient: appointment.patient,
      phone: appointment.phone,
      address: appointment.address,
      doctor: appointment.doctor,
      date: appointment.date,
      time: appointment.time,
      status: appointment.status,
    });
    setModalMode('edit');
  }

  function closeModal() {
    setModalMode(null);
    setSelected(null);
  }

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (modalMode === 'edit' && selected) {
      setAppointments((prev) =>
        prev.map((a) => (a.id === selected.id ? { ...a, ...form } : a))
      );
    } else {
      const nextId = `#APT-${1000 + appointments.length + 1}`;
      setAppointments((prev) => [...prev, { id: nextId, ...form }]);
    }
    closeModal();
  }

  function cancelAppointment(id: string) {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'Cancelled' } : a))
    );
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
              {appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td>{appointment.id}</td>
                  <td>{appointment.patient}</td>
                  <td>{appointment.doctor}</td>
                  <td>{appointment.date} - {appointment.time}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${STATUS_CLASS[appointment.status]}`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionGroup}>
                      <button
                        className="btn btn-outline"
                        style={{ padding: '4px 12px', fontSize: '0.8rem' }}
                        onClick={() => openView(appointment)}
                      >
                        View
                      </button>
                      <button
                        className="btn btn-outline"
                        style={{ padding: '4px 12px', fontSize: '0.8rem' }}
                        onClick={() => openEdit(appointment)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-outline"
                        style={{ padding: '4px 12px', fontSize: '0.8rem', color: '#991b1b', borderColor: '#991b1b' }}
                        onClick={() => cancelAppointment(appointment.id)}
                        disabled={appointment.status === 'Cancelled'}
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalMode === 'view' && selected && (
        <Modal title={`Appointment ${selected.id}`} onClose={closeModal}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Patient</span>
            <span className={styles.detailValue}>{selected.patient}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Phone</span>
            <span className={styles.detailValue}>{selected.phone}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Address</span>
            <span className={styles.detailValue}>{selected.address}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Doctor</span>
            <span className={styles.detailValue}>{selected.doctor}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Date</span>
            <span className={styles.detailValue}>{selected.date}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Time</span>
            <span className={styles.detailValue}>{selected.time}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Status</span>
            <span className={styles.detailValue}>{selected.status}</span>
          </div>
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
              <label htmlFor="address">Address</label>
              <textarea id="address" name="address" rows={2} value={form.address} onChange={handleFormChange} required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="doctor">Doctor</label>
              <input id="doctor" name="doctor" value={form.doctor} onChange={handleFormChange} required />
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="date">Date</label>
                <input id="date" name="date" type="date" value={form.date} onChange={handleFormChange} required />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="time">Time</label>
                <input id="time" name="time" type="time" value={form.time} onChange={handleFormChange} required />
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
              <button type="submit" className="btn btn-primary">{modalMode === 'edit' ? 'Save Changes' : 'Create Appointment'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
