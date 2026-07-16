export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface StoredPatient extends Patient {
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  phone: string;
  address: string;
  password: string;
}

const PATIENTS_KEY = 'hma_patients';
const SESSION_KEY = 'hma_session';

function readPatients(): StoredPatient[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(PATIENTS_KEY) || '[]');
  } catch {
    return [];
  }
}

function writePatients(patients: StoredPatient[]) {
  localStorage.setItem(PATIENTS_KEY, JSON.stringify(patients));
}

function toPublicPatient(stored: StoredPatient): Patient {
  const { password, ...patient } = stored;
  return patient;
}

// No backend exists yet — this is a client-only mock store (localStorage), not real auth.
export function registerPatient(input: RegisterInput): { success: boolean; error?: string; patient?: Patient } {
  const patients = readPatients();
  if (patients.some((p) => p.email.toLowerCase() === input.email.toLowerCase())) {
    return { success: false, error: 'An account with this email already exists.' };
  }
  const stored: StoredPatient = { id: `PT-${Date.now()}`, ...input };
  patients.push(stored);
  writePatients(patients);
  return { success: true, patient: toPublicPatient(stored) };
}

export function findPatientByCredentials(email: string, password: string): Patient | null {
  const found = readPatients().find(
    (p) => p.email.toLowerCase() === email.toLowerCase() && p.password === password
  );
  return found ? toPublicPatient(found) : null;
}

export function getSession(): Patient | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setSession(patient: Patient) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(patient));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
