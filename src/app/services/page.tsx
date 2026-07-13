import Link from 'next/link';
import styles from './services.module.css';

const SERVICES = [
  { id: 1, title: "General Medicine", icon: "🩺", desc: "Expert primary care for everyday health needs, preventive checkups, and chronic condition management." },
  { id: 2, title: "Cardiology", icon: "❤️", desc: "Advanced heart care with state-of-the-art diagnostics, ECG, Echocardiogram, and specialized treatments." },
  { id: 3, title: "Neurology", icon: "🧠", desc: "Comprehensive treatment for nervous system disorders by leading neurologists and advanced imaging." },
  { id: 4, title: "Pediatrics", icon: "👶", desc: "Compassionate healthcare for infants, children, and adolescents including vaccination and growth tracking." },
  { id: 5, title: "Surgery", icon: "⚕️", desc: "Minimally invasive and complex surgical procedures in modern, fully-equipped operation theaters." },
  { id: 6, title: "Intensive Care (ICU)", icon: "🏥", desc: "24/7 monitoring and life support for critically ill patients with specialized nursing care." },
  { id: 7, title: "Orthopedics", icon: "🦴", desc: "Expert care for bone, joint, and muscle issues, including joint replacement and sports injuries." },
  { id: 8, title: "Gynecology", icon: "🤰", desc: "Comprehensive women's health services, maternity care, and advanced fertility treatments." },
  { id: 9, title: "Radiology & Imaging", icon: "☢️", desc: "High-resolution MRI, CT Scans, X-rays, and Ultrasound for accurate and swift diagnosis." }
];

export default function ServicesPage() {
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
          {SERVICES.map(service => (
            <div key={service.id} className={styles.card}>
              <div className={styles.iconBox}>{service.icon}</div>
              <h3>{service.title}</h3>
              <p>{service.desc}</p>
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
          <button className="btn btn-primary">Try AI Checker</button>
        </div>
      </div>
    </div>
  );
}
