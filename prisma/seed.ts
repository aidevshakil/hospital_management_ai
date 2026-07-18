/**
 * Seed script for Hospital Management AI.
 *
 * Populates the database with data that mirrors the frontend mock data so the
 * app has something realistic to render against. Safe to re-run: it upserts by
 * natural keys (email / code / name) and clears appointments+notifications first.
 *
 * Run with:  npx prisma db seed
 */
import 'dotenv/config';
import { PrismaClient, DoctorStatus, DocumentType, AppointmentStatus, AdminRole, NotificationType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set. Add it to backend/.env');
}
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function main() {
  console.log('🌱 Seeding database...');

  // ---- Departments / Services (from services page) --------------------------
  const departments = [
    { name: 'General Medicine', icon: '🩺', description: 'Expert primary care for everyday health needs, preventive checkups, and chronic condition management.', isSpecialized: false },
    { name: 'Cardiology', icon: '❤️', description: 'Advanced heart care with state-of-the-art diagnostics, ECG, Echocardiogram, and specialized treatments.', isSpecialized: true },
    { name: 'Neurology', icon: '🧠', description: 'Comprehensive treatment for nervous system disorders by leading neurologists and advanced imaging.', isSpecialized: true },
    { name: 'Pediatrics', icon: '👶', description: 'Compassionate healthcare for infants, children, and adolescents including vaccination and growth tracking.', isSpecialized: false },
    { name: 'Surgery', icon: '⚕️', description: 'Minimally invasive and complex surgical procedures in modern, fully-equipped operation theaters.', isSpecialized: false },
    { name: 'Intensive Care (ICU)', icon: '🏥', description: '24/7 monitoring and life support for critically ill patients with specialized nursing care.', isSpecialized: true },
    { name: 'Orthopedics', icon: '🦴', description: 'Expert care for bone, joint, and muscle issues, including joint replacement and sports injuries.', isSpecialized: false },
    { name: 'Gynecology', icon: '🤰', description: "Comprehensive women's health services, maternity care, and advanced fertility treatments.", isSpecialized: false },
    { name: 'Radiology & Imaging', icon: '☢️', description: 'High-resolution MRI, CT Scans, X-rays, and Ultrasound for accurate and swift diagnosis.', isSpecialized: true },
  ];

  const deptByName = new Map<string, string>();
  for (const dept of departments) {
    const record = await prisma.department.upsert({
      where: { name: dept.name },
      update: { icon: dept.icon, description: dept.description, isSpecialized: dept.isSpecialized, slug: slugify(dept.name) },
      create: { ...dept, slug: slugify(dept.name) },
    });
    deptByName.set(dept.name, record.id);
  }
  console.log(`  ✓ ${departments.length} departments`);

  // ---- Emergency services (from emergency page) -----------------------------
  const emergencyServices = [
    { title: '24/7 Trauma Center', icon: '🚑', description: 'Immediate care for severe injuries with a dedicated trauma team on standby around the clock.' },
    { title: 'Cardiac Emergency', icon: '❤️', description: 'Rapid response for heart attacks and cardiac events with a fully equipped cath lab.' },
    { title: 'Stroke Unit', icon: '🧠', description: 'Time-critical stroke care with advanced imaging and clot-busting treatment protocols.' },
    { title: 'Ambulance Service', icon: '🚨', description: 'Fully-equipped ambulances with paramedics available for emergency transport 24/7.' },
  ];
  for (const [i, svc] of emergencyServices.entries()) {
    const existing = await prisma.emergencyService.findFirst({ where: { title: svc.title } });
    if (existing) {
      await prisma.emergencyService.update({ where: { id: existing.id }, data: { ...svc, sortOrder: i } });
    } else {
      await prisma.emergencyService.create({ data: { ...svc, sortOrder: i } });
    }
  }
  console.log(`  ✓ ${emergencyServices.length} emergency services`);

  // ---- Doctors (from public doctors page) -----------------------------------
  const doctors = [
    { code: '#DOC-1001', name: 'Dr. Sarah Jenkins', specialty: 'Cardiology', experience: '15 Years', education: 'MD, FACC', availableDays: 'Mon, Wed, Fri', image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80' },
    { code: '#DOC-1002', name: 'Dr. Robert Chen', specialty: 'Neurology', experience: '12 Years', education: 'MBBS, MD', availableDays: 'Tue, Thu', image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80' },
    { code: '#DOC-1003', name: 'Dr. Emily Smith', specialty: 'Pediatrics', experience: '8 Years', education: 'MBBS, DCH', availableDays: 'Mon-Sat', image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=400&q=80' },
    { code: '#DOC-1004', name: 'Dr. Michael Hasan', specialty: 'General Medicine', experience: '20 Years', education: 'MBBS, FCPS', availableDays: 'Mon-Fri', image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80' },
    { code: '#DOC-1005', name: 'Dr. Lisa Wong', specialty: 'Surgery', experience: '18 Years', education: 'MS, FRCS', availableDays: 'Wed, Fri', image: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=400&q=80' },
    { code: '#DOC-1006', name: 'Dr. David Kumar', specialty: 'Orthopedics', experience: '10 Years', education: 'MS Ortho', availableDays: 'Tue, Thu, Sat', image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80' },
  ];
  for (const doc of doctors) {
    const { specialty, ...rest } = doc;
    const departmentId = deptByName.get(specialty) ?? null;
    await prisma.doctor.upsert({
      where: { code: doc.code },
      update: { ...rest, departmentId, status: DoctorStatus.ACTIVE },
      create: { ...rest, departmentId, status: DoctorStatus.ACTIVE },
    });
  }
  console.log(`  ✓ ${doctors.length} doctors`);

  // ---- Patients (from admin patients page) ----------------------------------
  const passwordHash = await bcrypt.hash('Password123!', 10);
  const patientSeed = [1, 2, 3, 4].map((n) => ({
    code: `#PAT-${5000 + n}`,
    name: `Jane Smith ${n}`,
    email: `jane${n}@example.com`,
    phone: `+1 555-020${n}`,
    address: `${200 + n} Elm St, Springfield`,
    lastVisit: new Date('2023-10-10'),
    medicalHistory: ['Hypertension - diagnosed 2019', 'Seasonal allergies', 'Appendectomy - 2015'],
    documents: [
      { name: 'Blood Test Report.pdf', type: DocumentType.PDF, uploadedAt: new Date('2023-10-08') },
      { name: 'Chest X-Ray.jpg', type: DocumentType.IMAGE, uploadedAt: new Date('2023-10-09') },
      { name: 'Insurance Form.docx', type: DocumentType.DOC, uploadedAt: new Date('2023-10-10') },
    ],
  }));

  for (const p of patientSeed) {
    const { medicalHistory, documents, ...patientData } = p;
    const patient = await prisma.patient.upsert({
      where: { email: p.email },
      update: { ...patientData, password: passwordHash },
      create: { ...patientData, password: passwordHash },
    });
    // Reset child rows so re-seeding stays idempotent.
    await prisma.medicalHistoryEntry.deleteMany({ where: { patientId: patient.id } });
    await prisma.patientDocument.deleteMany({ where: { patientId: patient.id } });
    await prisma.medicalHistoryEntry.createMany({
      data: medicalHistory.map((description) => ({ patientId: patient.id, description })),
    });
    await prisma.patientDocument.createMany({
      data: documents.map((d) => ({ patientId: patient.id, name: d.name, type: d.type, uploadedAt: d.uploadedAt })),
    });
  }
  console.log(`  ✓ ${patientSeed.length} patients (with history + documents)`);

  // ---- Admin (from settings page) -------------------------------------------
  const adminHash = await bcrypt.hash('Admin123!', 10);
  await prisma.admin.upsert({
    where: { email: 'admin@hospital.com' },
    update: { name: 'Admin User', phone: '+1 555-0100', role: AdminRole.SUPERADMIN },
    create: { name: 'Admin User', email: 'admin@hospital.com', phone: '+1 555-0100', password: adminHash, role: AdminRole.SUPERADMIN },
  });
  console.log('  ✓ 1 admin (admin@hospital.com)');

  // ---- Appointments (from admin appointments page) --------------------------
  // Rebuild appointments + their notifications from scratch each run.
  await prisma.notification.deleteMany({});
  await prisma.appointment.deleteMany({});

  const seededPatients = await prisma.patient.findMany({ orderBy: { code: 'asc' } });
  const seededDoctors = await prisma.doctor.findMany({ orderBy: { code: 'asc' } });

  const appointmentSeed = [
    { code: '#APT-1001', doctorIdx: 0, patientIdx: 0, date: new Date('2023-10-12T09:00:00'), time: '09:00 AM', status: AppointmentStatus.CONFIRMED },
    { code: '#APT-1002', doctorIdx: 1, patientIdx: 1, date: new Date('2023-10-13T11:30:00'), time: '11:30 AM', status: AppointmentStatus.PENDING },
    { code: '#APT-1003', doctorIdx: 2, patientIdx: 2, date: new Date('2023-10-11T14:00:00'), time: '02:00 PM', status: AppointmentStatus.COMPLETED },
    { code: '#APT-1004', doctorIdx: 3, patientIdx: 3, date: new Date('2023-10-14T16:15:00'), time: '04:15 PM', status: AppointmentStatus.CANCELLED },
  ];

  for (const a of appointmentSeed) {
    const patient = seededPatients[a.patientIdx];
    const doctor = seededDoctors[a.doctorIdx];
    await prisma.appointment.create({
      data: {
        code: a.code,
        date: a.date,
        time: a.time,
        status: a.status,
        patientName: patient?.name ?? 'Guest Patient',
        patientPhone: patient?.phone ?? null,
        patientAddress: patient?.address ?? null,
        patientId: patient?.id ?? null,
        doctorId: doctor?.id ?? null,
        departmentId: doctor?.departmentId ?? null,
      },
    });
  }
  console.log(`  ✓ ${appointmentSeed.length} appointments`);

  // ---- Notifications (from admin notifications page) ------------------------
  const notifications = [
    { code: '#NTF-1', message: 'New appointment booked with Dr. Sarah Jenkins.', type: NotificationType.APPOINTMENT, read: false },
    { code: '#NTF-2', message: 'New patient Jane Smith 3 registered.', type: NotificationType.PATIENT, read: false },
    { code: '#NTF-3', message: 'Appointment #APT-1004 was cancelled.', type: NotificationType.APPOINTMENT, read: false },
    { code: '#NTF-4', message: 'Dr. David Kumar updated their availability.', type: NotificationType.DOCTOR, read: true },
  ];
  for (const n of notifications) {
    await prisma.notification.create({ data: n });
  }
  console.log(`  ✓ ${notifications.length} notifications`);

  console.log('✅ Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
