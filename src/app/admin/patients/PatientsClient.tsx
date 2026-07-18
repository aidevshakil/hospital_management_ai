'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '../../../components/Admin/Modal';
import styles from '../adminPages.module.css';
import { addMedicalHistory, deleteMedicalHistory } from './actions';

export interface PatientDocument {
  name: string;
  type: 'pdf' | 'image' | 'doc';
  uploadedAt: string;
  url?: string | null;
}

export interface MedicalHistoryItem {
  id: string;
  description: string;
}

export interface Patient {
  id: string;
  dbId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  lastVisit: string;
  medicalHistory: MedicalHistoryItem[];
  documents: PatientDocument[];
}

const DOCUMENT_ICONS: Record<PatientDocument['type'], string> = {
  pdf: '📄',
  image: '🖼️',
  doc: '📝',
};

export default function PatientsClient({ patients }: { patients: Patient[] }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<PatientDocument | null>(null);
  const [historyInput, setHistoryInput] = useState('');
  const [historyError, setHistoryError] = useState('');
  const [pending, startTransition] = useTransition();

  // Derive the live record from props so it reflects mutations after refresh.
  const selected = patients.find((p) => p.dbId === selectedId) ?? null;

  function openRecord(id: string) {
    setSelectedId(id);
    setHistoryInput('');
    setHistoryError('');
  }

  function handleAddHistory() {
    if (!selected) return;
    setHistoryError('');
    startTransition(async () => {
      const res = await addMedicalHistory(selected.dbId, historyInput);
      if (!res.ok) setHistoryError(res.error ?? 'Could not add entry.');
      else {
        setHistoryInput('');
        router.refresh();
      }
    });
  }

  function handleDeleteHistory(entryId: string) {
    startTransition(async () => {
      await deleteMedicalHistory(entryId);
      router.refresh();
    });
  }

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
              {patients.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    No patients found.
                  </td>
                </tr>
              ) : (
                patients.map((patient) => (
                  <tr key={patient.id}>
                    <td>{patient.id}</td>
                    <td>{patient.name}</td>
                    <td>{patient.email}</td>
                    <td>{patient.lastVisit}</td>
                    <td>
                      <button
                        className="btn btn-outline"
                        style={{ padding: '4px 12px', fontSize: '0.8rem' }}
                        onClick={() => openRecord(patient.dbId)}
                      >
                        View Record
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <Modal title={`Patient Record ${selected.id}`} onClose={() => setSelectedId(null)}>
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
                <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none' }}>
                  {selected.medicalHistory.map((entry) => (
                    <li
                      key={entry.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                        padding: '0.3rem 0',
                      }}
                    >
                      <span>• {entry.description}</span>
                      <button
                        onClick={() => handleDeleteHistory(entry.id)}
                        disabled={pending}
                        style={{ color: '#dc2626', fontSize: '0.75rem', fontWeight: 600, flexShrink: 0 }}
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                'No recorded history'
              )}

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                <input
                  value={historyInput}
                  onChange={(e) => setHistoryInput(e.target.value)}
                  placeholder="Add history entry, e.g. Hypertension — diagnosed 2019"
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddHistory(); } }}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    padding: '0.5rem 0.7rem',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    fontSize: '0.85rem',
                  }}
                />
                <button
                  className="btn btn-primary"
                  style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem' }}
                  onClick={handleAddHistory}
                  disabled={pending || !historyInput.trim()}
                >
                  Add
                </button>
              </div>
              {historyError && (
                <p style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.4rem' }}>{historyError}</p>
              )}
            </span>
          </div>
          <div className={styles.detailRow} style={{ alignItems: 'flex-start' }}>
            <span className={styles.detailLabel}>Uploaded Documents</span>
            <span className={styles.detailValue}>
              {selected.documents.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none' }}>
                  {selected.documents.map((doc, i) => (
                    <li
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                        padding: '0.4rem 0',
                      }}
                    >
                      <span>
                        {DOCUMENT_ICONS[doc.type]} {doc.name}{' '}
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          ({doc.uploadedAt})
                        </span>
                      </span>
                      <button
                        className="btn btn-outline"
                        style={{ padding: '2px 10px', fontSize: '0.75rem' }}
                        onClick={() => setPreviewDoc(doc)}
                      >
                        View
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                'No documents uploaded'
              )}
            </span>
          </div>
        </Modal>
      )}

      {previewDoc && (
        <Modal title={previewDoc.name} onClose={() => setPreviewDoc(null)}>
          {previewDoc.url ? (
            previewDoc.type === 'image' ? (
              <img
                src={previewDoc.url}
                alt={previewDoc.name}
                style={{ maxWidth: '100%', borderRadius: 8, margin: '0 auto' }}
              />
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ padding: '1.5rem 0', fontSize: '3rem' }}>
                  {DOCUMENT_ICONS[previewDoc.type]}
                </div>
                <a
                  href={previewDoc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={previewDoc.name}
                  className="btn btn-primary"
                >
                  Open / Download
                </a>
                <p style={{ color: 'var(--text-muted)', marginTop: '1rem', fontSize: '0.85rem' }}>
                  Uploaded on {previewDoc.uploadedAt}.
                </p>
              </div>
            )
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ padding: '2rem 0', fontSize: '3rem' }}>
                {DOCUMENT_ICONS[previewDoc.type]}
              </div>
              <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
                Uploaded on {previewDoc.uploadedAt}. No file content is stored for this document.
              </p>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
