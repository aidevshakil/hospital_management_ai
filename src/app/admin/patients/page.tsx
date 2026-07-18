import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/format';
import PatientsClient, { Patient } from './PatientsClient';

const DOC_TYPE_MAP = { PDF: 'pdf', IMAGE: 'image', DOC: 'doc' } as const;

export default async function AdminPatients() {
  const patients = await prisma.patient.findMany({
    orderBy: { code: 'asc' },
    include: {
      medicalHistory: { orderBy: { recordedAt: 'asc' } },
      documents: { orderBy: { uploadedAt: 'asc' } },
    },
  });

  const data: Patient[] = patients.map((p) => ({
    id: p.code ?? p.id,
    dbId: p.id,
    name: p.name,
    email: p.email,
    phone: p.phone ?? '—',
    address: p.address ?? '—',
    lastVisit: formatDate(p.lastVisit),
    medicalHistory: p.medicalHistory.map((m) => ({ id: m.id, description: m.description })),
    documents: p.documents.map((d) => ({
      name: d.name,
      type: DOC_TYPE_MAP[d.type],
      uploadedAt: formatDate(d.uploadedAt),
      url: d.url,
    })),
  }));

  return <PatientsClient patients={data} />;
}
