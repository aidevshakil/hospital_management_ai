'use client';
import { useState } from 'react';
import styles from './appointment.module.css';

export default function AppointmentPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    department: 'General Medicine',
    doctor: '',
    date: '',
    time: '',
    symptoms: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for actual booking logic
    alert('Appointment booking request submitted successfully! We will contact you shortly.');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className="container">
          <h1 className={styles.title}>Book an Appointment</h1>
          <p className={styles.subtitle}>Fill out the form below or use our AI assistant to find the right doctor.</p>
        </div>
      </div>

      <div className={`container ${styles.content}`}>
        <div className={styles.splitLayout}>
          
          {/* Booking Form */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Patient Information</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
              
              <div className={styles.formGroup}>
                <label htmlFor="name">Full Name</label>
                <input type="text" id="name" name="name" required placeholder="John Doe" value={formData.name} onChange={handleChange} />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="phone">Phone Number</label>
                <input type="tel" id="phone" name="phone" required placeholder="+1 234 567 8900" value={formData.phone} onChange={handleChange} />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="department">Department</label>
                  <select id="department" name="department" value={formData.department} onChange={handleChange}>
                    <option value="General Medicine">General Medicine</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Surgery">Surgery</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="doctor">Preferred Doctor (Optional)</label>
                  <select id="doctor" name="doctor" value={formData.doctor} onChange={handleChange}>
                    <option value="">Any Available Doctor</option>
                    <option value="1">Dr. Sarah Jenkins</option>
                    <option value="2">Dr. Robert Chen</option>
                    <option value="3">Dr. Emily Smith</option>
                  </select>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="date">Preferred Date</label>
                  <input type="date" id="date" name="date" required value={formData.date} onChange={handleChange} />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="time">Preferred Time</label>
                  <select id="time" name="time" required value={formData.time} onChange={handleChange}>
                    <option value="">Select Time</option>
                    <option value="morning">Morning (9 AM - 12 PM)</option>
                    <option value="afternoon">Afternoon (1 PM - 4 PM)</option>
                    <option value="evening">Evening (5 PM - 8 PM)</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="symptoms">Briefly describe your symptoms</label>
                <textarea 
                  id="symptoms" 
                  name="symptoms" 
                  rows={4} 
                  placeholder="E.g., fever, headache for 3 days..."
                  value={formData.symptoms} 
                  onChange={handleChange}
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                Confirm Booking
              </button>
            </form>
          </div>

          {/* AI Assistant Banner */}
          <div className={styles.aiBanner}>
            <div className={styles.aiIcon}>✨</div>
            <h3>Not sure which doctor to see?</h3>
            <p>Describe your symptoms to our AI Chatbot and it will suggest the best department and specialist for your needs.</p>
            <button className="btn btn-secondary" style={{ width: '100%' }}>
              Try AI Symptom Checker
            </button>
            
            <div className={styles.aiFeatures}>
              <ul>
                <li>✓ Instant Recommendations</li>
                <li>✓ 24/7 Availability</li>
                <li>✓ Privacy Protected</li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
