import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerGrid}`}>
        <div>
          <h3 className={styles.brand}>
            <span className={styles.logoText}>Hospital</span>
            <span className={styles.logoHighlight}>AI</span>
          </h3>
          <p className={styles.description}>
            Modern healthcare powered by AI. Your health, our commitment.
          </p>
        </div>
        
        <div>
          <h4 className={styles.heading}>Quick Links</h4>
          <ul className={styles.linkList}>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/doctors">Find a Doctor</Link></li>
            <li><Link href="/appointment">Book Appointment</Link></li>
            <li><Link href="/services">Our Services</Link></li>
          </ul>
        </div>

        <div>
          <h4 className={styles.heading}>Contact Us</h4>
          <ul className={styles.linkList}>
            <li>123 Healthcare Ave, Medical City</li>
            <li>Phone: +1 234 567 890</li>
            <li>Email: support@hospitalai.com</li>
          </ul>
        </div>
        
        <div>
          <h4 className={styles.heading}>Emergency</h4>
          <div className={styles.emergencyCard}>
            <p className={styles.emergencyText}>24/7 Hotline</p>
            <p className={styles.emergencyNumber}>911 / 1066</p>
          </div>
        </div>
      </div>
      
      <div className={styles.copyright}>
        <p>&copy; {new Date().getFullYear()} Hospital AI. All rights reserved.</p>
      </div>
    </footer>
  );
}
