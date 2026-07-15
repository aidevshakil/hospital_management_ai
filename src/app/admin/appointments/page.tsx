import styles from '../adminPages.module.css';

export default function AdminAppointments() {
  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Appointments</h1>
          <p className={styles.pageDescription}>Manage all patient appointments.</p>
        </div>
        <button className="btn btn-primary">+ New Appointment</button>
      </div>

      <div className={styles.card}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Patient Name</th>
                <th>Doctor</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {/* Dummy data */}
              {[1, 2, 3, 4, 5].map((item) => (
                <tr key={item}>
                  <td>#APT-{1000 + item}</td>
                  <td>Patient {item}</td>
                  <td>Dr. Example</td>
                  <td>Oct 12, 2023 - 09:00 AM</td>
                  <td><span className={`${styles.statusBadge} ${item % 2 === 0 ? styles.statusConfirmed : styles.statusPending}`}>{item % 2 === 0 ? 'Confirmed' : 'Pending'}</span></td>
                  <td>
                    <button className="btn btn-outline" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
