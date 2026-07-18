/**
 * Human-readable display codes derived from each row's monotonic `seq`
 * (a Postgres SERIAL). Deriving from `seq` instead of a live `count()` makes
 * code assignment race-free: two concurrent inserts get distinct seq values,
 * so they can never collide on the same code.
 *
 * Bases match the original count-based scheme (first row = #PAT-5001 / #APT-1001
 * / #DOC-1001) so existing codes stay consistent.
 */

export const patientCode = (seq: number): string => `#PAT-${5000 + seq}`;
export const appointmentCode = (seq: number): string => `#APT-${1000 + seq}`;
export const doctorCode = (seq: number): string => `#DOC-${1000 + seq}`;
