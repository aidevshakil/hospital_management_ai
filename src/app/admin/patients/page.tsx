'use client';

import { useState } from 'react';
import Modal from '../../../components/Admin/Modal';
import styles from '../adminPages.module.css';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  lastVisit: string;
  medicalHistory: string[];
}

const PATIENTS: Patient[] = [1, 2, 3, 4].map((item) => ({
  id: `#PAT-${5000 + item}`,
  name: `Jane Smith ${item}`,
  email: `jane${item}@example.com`,
  phone: `+1 555-020${item}`,
  address: `${200 + item} Elm St, Springfield`,
  lastVisit: 'Oct 10, 2023',
  medicalHistory: [
    'Hypertension - diagnosed 2019',
    'Seasonal allergies',
    'Appendectomy - 2015',
  ],
}));

export default function AdminPatients() {
  const [selected, setSelected] = useState<Patient | null>(null);

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Patients</h1>
          <p className={styles.pageDescription}>View and manage patient records.</p>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Patient ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Last Visit</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {PATIENTS.map((patient) => (
                <tr key={patient.id}>
                  <td>{patient.id}</td>
                  <td>{patient.name}</td>
                  <td>{patient.email}</td>
                  <td>{patient.lastVisit}</td>
                  <td>
                    <button
                      className="btn btn-outline"
                      style={{ padding: '4px 12px', fontSize: '0.8rem' }}
                      onClick={() => setSelected(patient)}
                    >
                      View Record
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <Modal title={`Patient Record ${selected.id}`} onClose={() => setSelected(null)}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Name</span>
            <span className={styles.detailValue}>{selected.name}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Email</span>
            <span className={styles.detailValue}>{selected.email}</span>
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
            <span className={styles.detailLabel}>Last Visit</span>
            <span className={styles.detailValue}>{selected.lastVisit}</span>
          </div>
          <div className={styles.detailRow} style={{ alignItems: 'flex-start' }}>
            <span className={styles.detailLabel}>Medical History</span>
            <span className={styles.detailValue}>
              {selected.medicalHistory.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
                  {selected.medicalHistory.map((entry, i) => (
                    <li key={i}>{entry}</li>
                  ))}
                </ul>
              ) : (
                'No recorded history'
              )}
            </span>
          </div>
        </Modal>
      )}
    </div>
  );
}
