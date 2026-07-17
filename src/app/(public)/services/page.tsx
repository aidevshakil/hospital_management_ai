import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import styles from './services.module.css';

export default async function ServicesPage() {
  const departments = await prisma.department.findMany({
    orderBy: { createdAt: 'asc' },
  });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className="container">
          <h1 className={styles.title}>All Medical Services</h1>
          <p className={styles.subtitle}>Comprehensive care tailored to your needs across various specialties.</p>
        </div>
      </div>

      <div className={`container ${styles.content}`}>
        <div className={styles.grid}>
          {departments.map(dept => (
            <div key={dept.id} className={styles.card}>
              <div className={styles.iconBox}>{dept.icon}</div>
              <h3>{dept.name}</h3>
              <p>{dept.description}</p>
              <div className={styles.cardAction}>
                <Link href="/appointment" className="btn btn-outline">
                  Book Consultation
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        <div className={styles.aiBanner}>
          <div className={styles.aiIcon}>✨</div>
          <div className={styles.aiText}>
            <h2>Not sure which service you need?</h2>
            <p>Describe your symptoms to our AI Chatbot and get instant recommendations.</p>
          </div>
          <Link href="/ai-checker" className="btn btn-primary">Try AI Checker</Link>
        </div>
      </div>
    </div>
  );
}
