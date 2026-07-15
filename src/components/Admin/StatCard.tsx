import styles from './Admin.module.css';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export default function StatCard({ title, value, icon, trend }: StatCardProps) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statCardHeader}>
        <h3 className={styles.statTitle}>{title}</h3>
        <div className={styles.statIcon}>{icon}</div>
      </div>
      <div className={styles.statValue}>{value}</div>
      {trend && (
        <div className={`${styles.statTrend} ${trend.isPositive ? styles.trendUp : styles.trendDown}`}>
          {trend.isPositive ? '↑' : '↓'} {trend.value}
          <span className={styles.trendLabel}>vs last month</span>
        </div>
      )}
    </div>
  );
}
