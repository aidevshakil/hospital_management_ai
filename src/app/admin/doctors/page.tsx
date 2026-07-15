import styles from '../adminPages.module.css';

export default function AdminDoctors() {
  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Doctors</h1>
          <p className={styles.pageDescription}>Manage doctors and their schedules.</p>
        </div>
        <button className="btn btn-primary">+ Add Doctor</button>
      </div>

      <div className={styles.card}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Doctor Name</th>
                <th>Specialty</th>
                <th>Experience</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {/* Dummy data */}
              {[1, 2, 3].map((item) => (
                <tr key={item}>
                  <td>Dr. John Doe {item}</td>
                  <td>Cardiology</td>
                  <td>10 Years</td>
                  <td><span className={`${styles.statusBadge} ${styles.statusConfirmed}`}>Active</span></td>
                  <td>
                    <button className="btn btn-outline" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>Edit</button>
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
