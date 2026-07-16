'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  Patient,
  RegisterInput,
  getSession,
  setSession,
  clearSession,
  findPatientByCredentials,
  registerPatient,
} from '../lib/patientAuth';

interface AuthResult {
  success: boolean;
  error?: string;
}

interface PatientAuthContextValue {
  patient: Patient | null;
  login: (email: string, password: string) => AuthResult;
  register: (input: RegisterInput) => AuthResult;
  logout: () => void;
}

const PatientAuthContext = createContext<PatientAuthContextValue | undefined>(undefined);

export function PatientAuthProvider({ children }: { children: ReactNode }) {
  const [patient, setPatient] = useState<Patient | null>(null);

  useEffect(() => {
    setPatient(getSession());
  }, []);

  function login(email: string, password: string): AuthResult {
    const found = findPatientByCredentials(email, password);
    if (!found) return { success: false, error: 'Invalid email or password.' };
    setSession(found);
    setPatient(found);
    return { success: true };
  }

  function register(input: RegisterInput): AuthResult {
    const result = registerPatient(input);
    if (!result.success || !result.patient) return { success: false, error: result.error };
    setSession(result.patient);
    setPatient(result.patient);
    return { success: true };
  }

  function logout() {
    clearSession();
    setPatient(null);
  }

  return (
    <PatientAuthContext.Provider value={{ patient, login, register, logout }}>
      {children}
    </PatientAuthContext.Provider>
  );
}

export function usePatientAuth() {
  const ctx = useContext(PatientAuthContext);
  if (!ctx) throw new Error('usePatientAuth must be used within PatientAuthProvider');
  return ctx;
}
