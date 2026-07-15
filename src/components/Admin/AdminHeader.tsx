import styles from './Admin.module.css';

export default function AdminHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <div className={styles.searchBar}>
          <span className={styles.searchIcon}>🔍</span>
          <input type="text" placeholder="Search across admin..." className={styles.searchInput} />
        </div>
      </div>
      
      <div className={styles.headerRight}>
        <button className={styles.iconBtn} aria-label="Notifications">
          🔔
          <span className={styles.badge}>3</span>
        </button>
        <div className={styles.profile}>
          <div className={styles.avatar}>A</div>
          <div className={styles.profileInfo}>
            <span className={styles.profileName}>Admin User</span>
            <span className={styles.profileRole}>Superadmin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
