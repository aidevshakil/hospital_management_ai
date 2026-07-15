import styles from '../adminPages.module.css';

export default function AdminPatients() {
  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Patients</h1>
          <p className={styles.pageDescription}>View and manage patient records.</p>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Patient ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Last Visit</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {/* Dummy data */}
              {[1, 2, 3, 4].map((item) => (
                <tr key={item}>
                  <td>#PAT-{5000 + item}</td>
                  <td>Jane Smith {item}</td>
                  <td>jane{item}@example.com</td>
                  <td>Oct 10, 2023</td>
                  <td>
                    <button className="btn btn-outline" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>View Record</button>
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
