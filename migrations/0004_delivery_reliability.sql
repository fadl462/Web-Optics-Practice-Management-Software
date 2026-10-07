PRAGMA foreign_keys = ON;

ALTER TABLE message_attempts ADD COLUMN next_attempt_at TEXT;

CREATE INDEX IF NOT EXISTS idx_message_attempts_next_attempt
  ON message_attempts(next_attempt_at, state);

CREATE TABLE IF NOT EXISTS message_delivery_events (
  id TEXT PRIMARY KEY,
  message_id TEXT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  provider_event_id TEXT,
  status TEXT NOT NULL,
  provider_message_id TEXT,
  error_code TEXT,
  error_message TEXT,
  received_at TEXT NOT NULL,
  UNIQUE(provider_event_id)
);

CREATE INDEX IF NOT EXISTS idx_delivery_events_message
  ON message_delivery_events(message_id, received_at);
