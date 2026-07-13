import Link from 'next/link';
import styles from './Navbar.module.css';

export default function Navbar() {
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
          <Link href="/appointment" className="btn btn-primary">
            Book Appointment
          </Link>
        </div>
      </div>
    </header>
  );
}
