-- Add the clinical summary field used by patient intake and the patient record workspace.
ALTER TABLE patients ADD COLUMN notes TEXT;
