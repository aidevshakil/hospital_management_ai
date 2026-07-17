'use client';

import { useState, useTransition } from 'react';
import Modal from '../../../components/Admin/Modal';
import styles from '../adminPages.module.css';
import { createDoctor, updateDoctor } from './actions';

export interface DoctorRow {
  dbId: string;
  id: string; // display code
  name: string;
  specialty: string;
  experience: string;
  education: string;
  available: string;
  image: string;
  status: 'Active' | 'Inactive';
}

const STATUS_CLASS: Record<DoctorRow['status'], string> = {
  Active: styles.statusConfirmed,
  Inactive: styles.statusCancelled,
};

type ModalMode = 'new' | 'edit' | null;

export default function DoctorsClient({
  doctors,
  specialties,
}: {
  doctors: DoctorRow[];
  specialties: string[];
}) {
  const emptyForm = {
    name: '',
    specialty: specialties[0] ?? '',
    experience: '',
    education: '',
    available: '',
    image: '',
    status: 'Active' as DoctorRow['status'],
  };

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selected, setSelected] = useState<DoctorRow | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isPending, startTransition] = useTransition();

  function openNew() {
    setForm(emptyForm);
    setSelected(null);
    setModalMode('new');
  }

  function openEdit(doctor: DoctorRow) {
    setSelected(doctor);
    setForm({
      name: doctor.name,
      specialty: doctor.specialty,
      experience: doctor.experience === '—' ? '' : doctor.experience,
      education: doctor.education === '—' ? '' : doctor.education,
      available: doctor.available === '—' ? '' : doctor.available,
      image: doctor.image,
      status: doctor.status,
    });
    setModalMode('edit');
  }

  function closeModal() {
    setModalMode(null);
    setSelected(null);
  }

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((prev) => ({ ...prev, image: reader.result as string }));
    reader.readAsDataURL(file);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...form };
    startTransition(async () => {
      if (modalMode === 'edit' && selected) {
        await updateDoctor(selected.dbId, payload);
      } else {
        await createDoctor(payload);
      }
      closeModal();
    });
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Doctors</h1>
          <p className={styles.pageDescription}>Manage doctors and their schedules.</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ Add Doctor</button>
      </div>

      <div className={styles.card}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Photo</th>
                <th>Doctor Name</th>
                <th>Specialty</th>
                <th>Experience</th>
                <th>Education</th>
                <th>Available</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {doctors.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No doctors yet.</td>
                </tr>
              ) : (
                doctors.map((doctor) => (
                  <tr key={doctor.dbId}>
                    <td>
                      {doctor.image ? (
                        <img src={doctor.image} alt={doctor.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--border-color, #e5e7eb)' }} />
                      )}
                    </td>
                    <td>{doctor.name}</td>
                    <td>{doctor.specialty}</td>
                    <td>{doctor.experience}</td>
                    <td>{doctor.education}</td>
                    <td>{doctor.available}</td>
                    <td><span className={`${styles.statusBadge} ${STATUS_CLASS[doctor.status]}`}>{doctor.status}</span></td>
                    <td>
                      <button className="btn btn-outline" style={{ padding: '4px 12px', fontSize: '0.8rem' }} onClick={() => openEdit(doctor)}>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {(modalMode === 'new' || modalMode === 'edit') && (
        <Modal title={modalMode === 'edit' ? `Edit ${selected?.name ?? ''}` : 'Add Doctor'} onClose={closeModal}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Doctor Name</label>
              <input id="name" name="name" value={form.name} onChange={handleFormChange} required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="image">Photo</label>
              <input id="image" name="image" type="file" accept="image/*" onChange={handleImageFile} />
              {form.image && (
                <img src={form.image} alt="Preview" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', marginTop: 8 }} />
              )}
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="specialty">Specialty</label>
                <select id="specialty" name="specialty" value={form.specialty} onChange={handleFormChange}>
                  {specialties.map((spec) => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="experience">Experience</label>
                <input id="experience" name="experience" placeholder="e.g. 10 Years" value={form.experience} onChange={handleFormChange} required />
              </div>
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="education">Education / Study</label>
                <input id="education" name="education" placeholder="e.g. MBBS, MD" value={form.education} onChange={handleFormChange} required />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="available">Available Days</label>
                <input id="available" name="available" placeholder="e.g. Mon, Wed, Fri" value={form.available} onChange={handleFormChange} required />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="status">Status</label>
              <select id="status" name="status" value={form.status} onChange={handleFormChange}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className={styles.formActions}>
              <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={isPending}>
                {isPending ? 'Saving…' : modalMode === 'edit' ? 'Save Changes' : 'Add Doctor'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
