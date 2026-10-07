PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS communication_preferences (
  patient_id TEXT PRIMARY KEY REFERENCES patients(id) ON DELETE CASCADE,
  sms_opt_in INTEGER CHECK (sms_opt_in IN (0,1) OR sms_opt_in IS NULL),
  email_opt_in INTEGER CHECK (email_opt_in IN (0,1) OR email_opt_in IS NULL),
  consent_source TEXT,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS message_attempts (
  id TEXT PRIMARY KEY,
  message_id TEXT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  attempt_no INTEGER NOT NULL,
  state TEXT NOT NULL,
  provider_message_id TEXT,
  error_code TEXT,
  error_message TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(message_id, attempt_no)
);
CREATE INDEX IF NOT EXISTS idx_message_attempts_message ON message_attempts(message_id, attempt_no);
CREATE INDEX IF NOT EXISTS idx_message_attempts_state ON message_attempts(state, updated_at);
