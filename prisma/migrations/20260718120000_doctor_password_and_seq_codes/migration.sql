-- Doctor portal login (nullable: existing doctors have no password until set)
ALTER TABLE "Doctor" ADD COLUMN "password" TEXT;

-- Race-free human-readable codes: a monotonic SERIAL backs each `code`.
-- SERIAL backfills existing rows via the sequence, so every row gets a unique value.
ALTER TABLE "Patient" ADD COLUMN "seq" SERIAL NOT NULL;
ALTER TABLE "Doctor" ADD COLUMN "seq" SERIAL NOT NULL;
ALTER TABLE "Appointment" ADD COLUMN "seq" SERIAL NOT NULL;

CREATE UNIQUE INDEX "Patient_seq_key" ON "Patient"("seq");
CREATE UNIQUE INDEX "Doctor_seq_key" ON "Doctor"("seq");
CREATE UNIQUE INDEX "Appointment_seq_key" ON "Appointment"("seq");
