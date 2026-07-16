'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { usePatientAuth } from '../../context/PatientAuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { patient, logout } = usePatientAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className={styles.header}>
      <div className={`container ${styles.navbar}`}>
        <div className={styles.logo}>
          <Link href="/">
            <span className={styles.logoText}>Hospital</span>
            <span className={styles.logoHighlight}>AI</span>
          </Link>
        </div>

        <nav className={styles.navLinks}>
          <Link href="/">Home</Link>
          <Link href="/doctors">Find a Doctor</Link>
          <Link href="/services">Services</Link>
          <Link href="/emergency" className={styles.emergencyLink}>Emergency</Link>
        </nav>

        <div className={styles.actions}>
          {patient ? (
            <>
              <span className={styles.greeting}>Hi, {patient.name.split(' ')[0]}</span>
              <button className="btn btn-outline" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className={styles.loginLink}>Login</Link>
              <Link href="/register" className="btn btn-outline">Register</Link>
            </>
          )}
          <Link href="/appointment" className="btn btn-primary">
            Book Appointment
          </Link>
        </div>

        <button
          className={styles.menuBtn}
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {menuOpen && (
        <div className={styles.mobileMenu}>
          <nav className={styles.mobileNavLinks}>
            <Link href="/">Home</Link>
            <Link href="/doctors">Find a Doctor</Link>
            <Link href="/services">Services</Link>
            <Link href="/emergency" className={styles.emergencyLink}>Emergency</Link>
          </nav>

          <div className={styles.mobileActions}>
            {patient ? (
              <>
                <span className={styles.greeting}>Hi, {patient.name.split(' ')[0]}</span>
                <button className="btn btn-outline" onClick={logout}>Logout</button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn btn-outline">Login</Link>
                <Link href="/register" className="btn btn-outline">Register</Link>
              </>
            )}
            <Link href="/appointment" className="btn btn-primary">
              Book Appointment
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
