'use client';
import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { usePatientAuth } from '../../../context/PatientAuthContext';
import styles from './appointment.module.css';
import { createAppointment } from './actions';

export interface DoctorOption {
  id: string;
  name: string;
  department: string;
}

export default function AppointmentForm({
  departments,
  doctors,
  initialDoctorId,
}: {
  departments: string[];
  doctors: DoctorOption[];
  initialDoctorId?: string;
}) {
  const { patient } = usePatientAuth();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: departments[0] ?? '',
    doctor: '',
    date: '',
    time: '',
    symptoms: '',
  });

  useEffect(() => {
    if (patient) {
      setFormData((prev) => ({ ...prev, name: patient.name, email: patient.email, phone: patient.phone }));
    }
  }, [patient]);

  // Preselect doctor + its department when arriving from a doctor card (?doctor=id).
  useEffect(() => {
    if (!initialDoctorId) return;
    const doc = doctors.find((d) => d.id === initialDoctorId);
    if (doc) {
      setFormData((prev) => ({ ...prev, department: doc.department, doctor: doc.id }));
    }
  }, [initialDoctorId, doctors]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'department') {
      setFormData({ ...formData, department: value, doctor: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    startTransition(async () => {
      const res = await createAppointment({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        doctorId: formData.doctor,
        date: formData.date,
        time: formData.time,
        symptoms: formData.symptoms,
      });
      if (res.ok) {
        setResult({ ok: true, message: `Appointment ${res.code} submitted! A confirmation has been sent to your email.` });
        setFormData((prev) => ({ ...prev, doctor: '', date: '', time: '', symptoms: '' }));
      } else {
        setResult({ ok: false, message: res.error ?? 'Something went wrong. Please try again.' });
      }
    });
  };

  const availableDoctors = doctors.filter((doc) => doc.department === formData.department);

  return (
    <div className={styles.formSection}>
      <h2 className={styles.sectionTitle}>Patient Information</h2>
      {!patient && (
        <p className={styles.guestBookingNote}>
          Booking as a guest. <Link href="/login">Log in</Link> or{' '}
          <Link href="/register">create an account</Link> to have your details filled in automatically next time.
        </p>
      )}

      {result && (
        <p
          className={styles.guestBookingNote}
          style={{
            background: result.ok ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
            color: result.ok ? 'var(--primary)' : '#b91c1c',
          }}
        >
          {result.message}
        </p>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Full Name</label>
          <input type="text" id="name" name="name" required placeholder="John Doe" value={formData.name} onChange={handleChange} />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" required placeholder="you@example.com" value={formData.email} onChange={handleChange} />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="phone">Phone Number</label>
            <input type="tel" id="phone" name="phone" required placeholder="+1 234 567 8900" value={formData.phone} onChange={handleChange} />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="department">Department</label>
            <select id="department" name="department" value={formData.department} onChange={handleChange}>
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="doctor">Preferred Doctor (Optional)</label>
            <select id="doctor" name="doctor" value={formData.doctor} onChange={handleChange}>
              <option value="">Any Available Doctor</option>
              {availableDoctors.map((doc) => (
                <option key={doc.id} value={doc.id}>{doc.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="date">Preferred Date</label>
            <input type="date" id="date" name="date" required value={formData.date} onChange={handleChange} />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="time">Preferred Time</label>
            <select id="time" name="time" required value={formData.time} onChange={handleChange}>
              <option value="">Select Time</option>
              <option value="morning">Morning (9 AM - 12 PM)</option>
              <option value="afternoon">Afternoon (1 PM - 4 PM)</option>
              <option value="evening">Evening (5 PM - 8 PM)</option>
            </select>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="symptoms">Briefly describe your symptoms</label>
          <textarea
            id="symptoms"
            name="symptoms"
            rows={4}
            placeholder="E.g., fever, headache for 3 days..."
            value={formData.symptoms}
            onChange={handleChange}
          ></textarea>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={isPending}>
          {isPending ? 'Submitting…' : 'Confirm Booking'}
        </button>
      </form>
    </div>
  );
}
