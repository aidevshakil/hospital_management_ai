export interface AdminSearchItem {
  id: string;
  title: string;
  subtitle: string;
  type: 'Page' | 'Doctor' | 'Patient' | 'Appointment';
  path: string;
}

export const ADMIN_SEARCH_INDEX: AdminSearchItem[] = [
  { id: 'page-dashboard', title: 'Dashboard', subtitle: 'Admin overview', type: 'Page', path: '/admin' },
  { id: 'page-appointments', title: 'Appointments', subtitle: 'Manage appointments', type: 'Page', path: '/admin/appointments' },
  { id: 'page-doctors', title: 'Doctors', subtitle: 'Manage doctors', type: 'Page', path: '/admin/doctors' },
  { id: 'page-patients', title: 'Patients', subtitle: 'Manage patients', type: 'Page', path: '/admin/patients' },
  { id: 'page-notifications', title: 'Notifications', subtitle: 'View notifications', type: 'Page', path: '/admin/notifications' },

  { id: 'doc-1001', title: 'Dr. John Doe 1', subtitle: 'Cardiology', type: 'Doctor', path: '/admin/doctors' },
  { id: 'doc-1002', title: 'Dr. John Doe 2', subtitle: 'Cardiology', type: 'Doctor', path: '/admin/doctors' },
  { id: 'doc-1003', title: 'Dr. John Doe 3', subtitle: 'Cardiology', type: 'Doctor', path: '/admin/doctors' },

  { id: 'pat-5001', title: 'Jane Smith 1', subtitle: 'jane1@example.com', type: 'Patient', path: '/admin/patients' },
  { id: 'pat-5002', title: 'Jane Smith 2', subtitle: 'jane2@example.com', type: 'Patient', path: '/admin/patients' },
  { id: 'pat-5003', title: 'Jane Smith 3', subtitle: 'jane3@example.com', type: 'Patient', path: '/admin/patients' },
  { id: 'pat-5004', title: 'Jane Smith 4', subtitle: 'jane4@example.com', type: 'Patient', path: '/admin/patients' },

  { id: 'apt-1001', title: '#APT-1001', subtitle: 'Patient 1 with Dr. Example', type: 'Appointment', path: '/admin/appointments' },
  { id: 'apt-1002', title: '#APT-1002', subtitle: 'Patient 2 with Dr. Example', type: 'Appointment', path: '/admin/appointments' },
  { id: 'apt-1003', title: '#APT-1003', subtitle: 'Patient 3 with Dr. Example', type: 'Appointment', path: '/admin/appointments' },
  { id: 'apt-1004', title: '#APT-1004', subtitle: 'Patient 4 with Dr. Example', type: 'Appointment', path: '/admin/appointments' },
  { id: 'apt-1005', title: '#APT-1005', subtitle: 'Patient 5 with Dr. Example', type: 'Appointment', path: '/admin/appointments' },
];

export function searchAdminIndex(query: string): AdminSearchItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return ADMIN_SEARCH_INDEX.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.type.toLowerCase().includes(q)
  ).slice(0, 8);
}
