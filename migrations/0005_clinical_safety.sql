PRAGMA foreign_keys = ON;

-- Clinical records are append-first. Amendments create a new version and retain the prior record.
ALTER TABLE medical_history ADD COLUMN status TEXT NOT NULL DEFAULT 'Active';
ALTER TABLE medical_history ADD COLUMN supersedes_id TEXT;
ALTER TABLE medical_history ADD COLUMN amended_by TEXT;
ALTER TABLE medical_history ADD COLUMN amended_at TEXT;

ALTER TABLE allergies ADD COLUMN status TEXT NOT NULL DEFAULT 'Active';
ALTER TABLE allergies ADD COLUMN supersedes_id TEXT;
ALTER TABLE allergies ADD COLUMN amended_by TEXT;
ALTER TABLE allergies ADD COLUMN amended_at TEXT;

ALTER TABLE medications ADD COLUMN supersedes_id TEXT;
ALTER TABLE medications ADD COLUMN amended_by TEXT;
ALTER TABLE medications ADD COLUMN amended_at TEXT;

ALTER TABLE prescriptions ADD COLUMN status TEXT NOT NULL DEFAULT 'Active';
ALTER TABLE prescriptions ADD COLUMN supersedes_id TEXT;
ALTER TABLE prescriptions ADD COLUMN amended_by TEXT;
ALTER TABLE prescriptions ADD COLUMN amended_at TEXT;

ALTER TABLE insurance_policies ADD COLUMN status_history TEXT;
ALTER TABLE insurance_policies ADD COLUMN supersedes_id TEXT;
ALTER TABLE insurance_policies ADD COLUMN amended_by TEXT;
ALTER TABLE insurance_policies ADD COLUMN amended_at TEXT;

CREATE INDEX IF NOT EXISTS idx_history_status ON medical_history(patient_id,status,event_date);
CREATE INDEX IF NOT EXISTS idx_allergy_status ON allergies(patient_id,status);
CREATE INDEX IF NOT EXISTS idx_rx_status ON prescriptions(patient_id,status,prescribed_at);
CREATE INDEX IF NOT EXISTS idx_insurance_status ON insurance_policies(patient_id,status,updated_at);
