/** Types shared between server auth code and client components. */

export interface PublicPatient {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  phone: string;
  address: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
  patient?: PublicPatient;
}
