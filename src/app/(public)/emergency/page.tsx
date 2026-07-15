import Link from 'next/link';
import styles from './emergency.module.css';

export const metadata = {
  title: 'Emergency Services | Hospital AI',
  description: '24/7 Emergency Care and Hotline',
};

const EMERGENCY_SERVICES = [
  {
    id: 1,
    title: "24/7 Trauma Center",
    icon: "🚑",
    desc: "Fully equipped trauma care unit ready to handle critical injuries, accidents, and life-threatening conditions at any hour."
  },
  {
    id: 2,
    title: "Cardiac Emergency",
    icon: "❤️‍🩹",
    desc: "Specialized rapid-response team for heart attacks and severe chest pains, equipped with state-of-the-art defibrillation and catheterization labs."
  },
  {
    id: 3,
    title: "Stroke Unit",
    icon: "🧠",
    desc: "Immediate stroke intervention protocols to minimize brain damage, including rapid CT scans and clot-busting therapies."
  }
];

export default function EmergencyPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className="container">
          <h1 className={styles.title}>
            <span aria-hidden="true">🚨</span> Emergency Care
          </h1>
          <p className={styles.subtitle}>
            For severe injuries, chest pain, difficulty breathing, or other life-threatening conditions, seek immediate medical attention.
          </p>
        </div>
      </div>

      <div className={`container ${styles.content}`}>
        <div className={styles.alertCard}>
          <div className={styles.alertIcon}>🚑</div>
          <h2 className={styles.hotlineTitle}>24/7 Emergency Hotline</h2>
          <p className={styles.hotlineNumber}>911 / 1066</p>
          <p style={{ marginBottom: '1.5rem', opacity: 0.9 }}>
            Call immediately if you or someone else is experiencing a medical emergency.
          </p>
          <a href="tel:911" className={`btn ${styles.alertAction}`}>
            Call Now
          </a>
        </div>

        <div className={styles.grid}>
          {EMERGENCY_SERVICES.map(service => (
            <div key={service.id} className={styles.card}>
              <div className={styles.cardIcon}>{service.icon}</div>
              <h3>{service.title}</h3>
              <p>{service.desc}</p>
            </div>
          ))}
        </div>

        <div className={styles.infoSection}>
          <h2>What to do in an emergency</h2>
          <div className={styles.guidelines}>
            <div className={styles.guidelineItem}>
              <div className={styles.guidelineNumber}>1</div>
              <div className={styles.guidelineText}>
                <h4>Stay Calm and Assess</h4>
                <p>Ensure the area is safe. Do not move severely injured persons unless they are in immediate danger.</p>
              </div>
            </div>
            
            <div className={styles.guidelineItem}>
              <div className={styles.guidelineNumber}>2</div>
              <div className={styles.guidelineText}>
                <h4>Call for Help</h4>
                <p>Dial our emergency hotline immediately. Provide clear information about your location and the nature of the emergency.</p>
              </div>
            </div>

            <div className={styles.guidelineItem}>
              <div className={styles.guidelineNumber}>3</div>
              <div className={styles.guidelineText}>
                <h4>Provide First Aid</h4>
                <p>If you are trained, provide CPR or basic first aid while waiting for medical professionals to arrive. Apply pressure to bleeding wounds.</p>
              </div>
            </div>
            
            <div className={styles.guidelineItem}>
              <div className={styles.guidelineNumber}>4</div>
              <div className={styles.guidelineText}>
                <h4>Gather Information</h4>
                <p>If possible, collect the patient's medical history, current medications, and any known allergies to provide to the paramedics.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
