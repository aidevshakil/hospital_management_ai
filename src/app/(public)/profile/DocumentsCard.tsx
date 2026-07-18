'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { uploadMyDocument, deleteMyDocument } from './actions';
import styles from './profile.module.css';

export interface DocDTO {
  id: string;
  name: string;
  type: string;
  url: string | null;
  uploadedLabel: string;
}

const DOC_ICON: Record<string, string> = { PDF: '📄', IMAGE: '🖼️', DOC: '📝' };
const MAX_BYTES = 5 * 1024 * 1024;

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Could not read file.'));
    reader.readAsDataURL(file);
  });
}

export default function DocumentsCard({ documents }: { documents: DocDTO[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');

    if (file.size > MAX_BYTES) {
      setError('File is too large (max 5 MB).');
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    let dataUrl: string;
    try {
      dataUrl = await readAsDataUrl(file);
    } catch {
      setError('Could not read that file.');
      return;
    }

    startTransition(async () => {
      const res = await uploadMyDocument({ name: file.name, mime: file.type, dataUrl });
      if (!res.ok) setError(res.error ?? 'Upload failed.');
      else router.refresh();
      if (inputRef.current) inputRef.current.value = '';
    });
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this document?')) return;
    setError('');
    startTransition(async () => {
      const res = await deleteMyDocument(id);
      if (!res.ok) setError(res.error ?? 'Could not delete.');
      else router.refresh();
    });
  }

  return (
    <section className={styles.card}>
      <div className={styles.cardHead}>
        <h2 className={styles.cardTitle}>Uploaded Documents</h2>
        <button
          className="btn btn-outline"
          onClick={() => inputRef.current?.click()}
          disabled={pending}
        >
          {pending ? 'Uploading…' : 'Upload'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,image/*,.doc,.docx"
          onChange={handleFile}
          hidden
        />
      </div>

      {error && <p className={styles.inlineError}>{error}</p>}

      {documents.length === 0 ? (
        <p className={styles.empty}>No documents uploaded yet.</p>
      ) : (
        <ul className={styles.docList}>
          {documents.map((d) => (
            <li key={d.id} className={styles.docItem}>
              <span className={styles.docIcon}>{DOC_ICON[d.type] ?? '📁'}</span>
              <div className={styles.docBody}>
                <p className={styles.docName}>{d.name}</p>
                <p className={styles.docMeta}>{d.type} · {d.uploadedLabel}</p>
              </div>
              {d.url && (
                <a href={d.url} target="_blank" rel="noopener noreferrer" className={styles.docLink}>
                  View
                </a>
              )}
              <button
                className={styles.linkBtnDanger}
                onClick={() => handleDelete(d.id)}
                disabled={pending}
                aria-label={`Delete ${d.name}`}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
