'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { PublicPatient, RegisterInput, AuthResult } from '../lib/auth-types';
import { registerPatient, loginPatient, logoutPatient } from '../app/(public)/auth-actions';

interface PatientAuthContextValue {
  patient: PublicPatient | null;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (input: RegisterInput) => Promise<AuthResult>;
  logout: () => Promise<void>;
}

const PatientAuthContext = createContext<PatientAuthContextValue | undefined>(undefined);

export function PatientAuthProvider({
  children,
  initialPatient = null,
}: {
  children: ReactNode;
  initialPatient?: PublicPatient | null;
}) {
  const router = useRouter();
  const [patient, setPatient] = useState<PublicPatient | null>(initialPatient);

  async function login(email: string, password: string): Promise<AuthResult> {
    const result = await loginPatient(email, password);
    if (result.success && result.patient) {
      setPatient(result.patient);
      router.refresh();
    }
    return result;
  }

  async function register(input: RegisterInput): Promise<AuthResult> {
    const result = await registerPatient(input);
    if (result.success && result.patient) {
      setPatient(result.patient);
      router.refresh();
    }
    return result;
  }

  async function logout(): Promise<void> {
    await logoutPatient();
    setPatient(null);
    router.refresh();
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
