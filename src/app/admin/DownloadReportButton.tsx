'use client';

import * as XLSX from 'xlsx';

export interface ReportStat {
  title: string;
  value: string;
}

export interface ReportAppointment {
  patient: string;
  doctor: string;
  time: string;
  status: string;
}

export default function DownloadReportButton({
  stats,
  appointments,
}: {
  stats: ReportStat[];
  appointments: ReportAppointment[];
}) {
  function downloadDashboardReport() {
    const statsSheet = XLSX.utils.json_to_sheet(stats.map((s) => ({ Stat: s.title, Value: s.value })));
    const appointmentsSheet = XLSX.utils.json_to_sheet(
      appointments.map((a) => ({
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

  return (
    <button className="btn btn-primary" onClick={downloadDashboardReport}>
      Download Report
    </button>
  );
}
