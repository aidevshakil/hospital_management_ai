-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "patientEmail" TEXT,
ADD COLUMN     "reminderSentAt" TIMESTAMP(3);
