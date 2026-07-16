'use client';

import * as XLSX from 'xlsx';
import StatCard from '../../components/Admin/StatCard';
import styles from './adminPages.module.css';

const STATS = [
  { title: 'Total Patients', value: '1,248' },
  { title: 'Appointments Today', value: '42' },
  { title: 'Available Doctors', value: '18' },
  { title: 'AI Consultations', value: '315' },
];

const RECENT_APPOINTMENTS = [
  { patient: 'Sarah Jenkins', doctor: 'Dr. Emily Chen (Cardiology)', time: '09:00 AM', status: 'Confirmed' },
  { patient: 'Michael Brown', doctor: 'Dr. James Wilson (Neurology)', time: '09:30 AM', status: 'Pending' },
  { patient: 'Emma Davis', doctor: 'Dr. Sarah Johnson (Pediatrics)', time: '10:00 AM', status: 'Completed' },
  { patient: 'William Taylor', doctor: 'Dr. Michael Lee (Orthopedics)', time: '10:45 AM', status: 'Cancelled' },
];

function downloadDashboardReport() {
  const statsSheet = XLSX.utils.json_to_sheet(
    STATS.map((s) => ({ Stat: s.title, Value: s.value }))
  );
  const appointmentsSheet = XLSX.utils.json_to_sheet(
    RECENT_APPOINTMENTS.map((a) => ({
      'Patient Name': a.patient,
      Doctor: a.doctor,
      Time: a.time,
      Status: a.status,
    }))
  );

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, statsSheet, 'Overview');
  XLSX.utils.book_append_sheet(workbook, appointmentsSheet, 'Recent Appointments');

  XLSX.writeFile(workbook, `dashboard-report-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export default function AdminDashboard() {
  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Dashboard Overview</h1>
          <p className={styles.pageDescription}>Welcome back! Here's what's happening at Hospital AI today.</p>
        </div>
        <button className="btn btn-primary" onClick={downloadDashboardReport}>Download Report</button>
      </div>

      <div className={styles.statsGrid}>
        <StatCard 
          title="Total Patients" 
          value="1,248" 
          icon="🧑‍🤝‍🧑" 
          trend={{ value: '12%', isPositive: true }} 
        />
        <StatCard 
          title="Appointments Today" 
          value="42" 
          icon="📅" 
          trend={{ value: '5%', isPositive: true }} 
        />
        <StatCard 
          title="Available Doctors" 
          value="18" 
          icon="👨‍⚕️" 
        />
        <StatCard 
          title="AI Consultations" 
          value="315" 
          icon="🤖" 
          trend={{ value: '24%', isPositive: true }} 
        />
      </div>

      <div className={styles.dashboardGrid}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Recent Appointments</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Doctor</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Sarah Jenkins</td>
                  <td>Dr. Emily Chen (Cardiology)</td>
                  <td>09:00 AM</td>
                  <td><span className={`${styles.statusBadge} ${styles.statusConfirmed}`}>Confirmed</span></td>
                </tr>
                <tr>
                  <td>Michael Brown</td>
                  <td>Dr. James Wilson (Neurology)</td>
                  <td>09:30 AM</td>
                  <td><span className={`${styles.statusBadge} ${styles.statusPending}`}>Pending</span></td>
                </tr>
                <tr>
                  <td>Emma Davis</td>
                  <td>Dr. Sarah Johnson (Pediatrics)</td>
                  <td>10:00 AM</td>
                  <td><span className={`${styles.statusBadge} ${styles.statusCompleted}`}>Completed</span></td>
                </tr>
                <tr>
                  <td>William Taylor</td>
                  <td>Dr. Michael Lee (Orthopedics)</td>
                  <td>10:45 AM</td>
                  <td><span className={`${styles.statusBadge} ${styles.statusCancelled}`}>Cancelled</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>System Activity</h2>
          <div className={styles.activityFeed}>
            <div className={styles.activityItem}>
              <div className={styles.activityDot}></div>
              <div className={styles.activityContent}>
                <p><strong>Dr. Chen</strong> updated patient records.</p>
                <span className={styles.activityTime}>10 mins ago</span>
              </div>
            </div>
            <div className={styles.activityItem}>
              <div className={styles.activityDot}></div>
              <div className={styles.activityContent}>
                <p>New appointment booked by <strong>Emma Davis</strong>.</p>
                <span className={styles.activityTime}>25 mins ago</span>
              </div>
            </div>
            <div className={styles.activityItem}>
              <div className={styles.activityDot}></div>
              <div className={styles.activityContent}>
                <p>AI Assistant generated 15 symptom reports.</p>
                <span className={styles.activityTime}>1 hour ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
