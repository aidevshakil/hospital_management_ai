import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.home}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroContent}`}>
          <div className={styles.heroText}>
            <span className={styles.badge}>24/7 Emergency Service</span>
            <h1 className={styles.title}>
              Your Health, <br />
              <span className={styles.highlight}>Our Commitment</span>
            </h1>
            <p className={styles.subtitle}>
              Experience modern, AI-driven healthcare with world-class specialists and cutting-edge facilities.
            </p>
            <div className={styles.heroActions}>
              <Link href="/appointment" className="btn btn-primary">
                Book Appointment
              </Link>
              <Link href="/doctors" className="btn btn-outline">
                Find a Doctor
              </Link>
            </div>
          </div>
          <div className={styles.heroImageContainer}>
            <div className={styles.heroImageWrapper}>
              <img 
                src="https://images.unsplash.com/photo-1551076805-e1869033e561?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                alt="Modern Hospital Building" 
                className={styles.heroImage}
              />
            </div>
            
            <div className={`${styles.floatingCard} ${styles.statsCard}`}>
              <div className={styles.iconBox}>👨‍⚕️</div>
              <div>
                <h3>50+</h3>
                <p>Top Specialists</p>
              </div>
            </div>
            
            <div className={`${styles.floatingCard} ${styles.ratingCard}`}>
              <div className={styles.iconBox}>⭐</div>
              <div>
                <h3>4.9/5</h3>
                <p>Patient Rating</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className={`container ${styles.services}`}>
        <div className={styles.sectionHeader}>
          <h2>Our Core Services</h2>
          <p>Comprehensive care tailored to your needs, from general medicine to specialized treatments.</p>
        </div>
        
        <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-8 ${styles.serviceGrid}`}>
          {/* General Medicine */}
          <div className={styles.serviceCard}>
            <div className={styles.serviceIcon}>🩺</div>
            <h3>General Medicine</h3>
            <p>Expert primary care for everyday health needs, preventive checkups, and chronic condition management.</p>
          </div>

          {/* Cardiology */}
          <div className={styles.serviceCard}>
            <div className={styles.serviceIcon}>❤️</div>
            <h3>Cardiology</h3>
            <p>Advanced heart care with state-of-the-art diagnostics and specialized treatments.</p>
          </div>

          {/* Neurology */}
          <div className={styles.serviceCard}>
            <div className={styles.serviceIcon}>🧠</div>
            <h3>Neurology</h3>
            <p>Comprehensive treatment for nervous system disorders by leading neurologists.</p>
          </div>

          {/* Pediatrics */}
          <div className={styles.serviceCard}>
            <div className={styles.serviceIcon}>👶</div>
            <h3>Pediatrics</h3>
            <p>Compassionate healthcare for infants, children, and adolescents.</p>
          </div>

          {/* Surgery */}
          <div className={styles.serviceCard}>
            <div className={styles.serviceIcon}>⚕️</div>
            <h3>Surgery</h3>
            <p>Minimally invasive and complex surgical procedures in modern operation theaters.</p>
          </div>

          {/* Intensive Care */}
          <div className={styles.serviceCard}>
            <div className={styles.serviceIcon}>🏥</div>
            <h3>Intensive Care (ICU)</h3>
            <p>24/7 monitoring and life support for critically ill patients.</p>
          </div>
        </div>
        
        <div className="text-center mt-8">
          <Link href="/services" className="btn btn-secondary">View All Services</Link>
        </div>
      </section>
    </div>
  );
}
