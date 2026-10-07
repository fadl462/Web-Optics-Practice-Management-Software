# OptiFlow v13 — Clinical Safety & Amendments

## New migration
Apply `migrations/0005_clinical_safety.sql` after migrations 0001–0004.

## Clinical record model
Clinical history, allergies, medications, prescriptions and insurance are now amended using an append-first pattern. A prior active record is retained and marked amended; the replacement becomes the active version. Every amendment creates an audit event.

## Deployment
1. Replace the current frontend/Worker files with this package.
2. Apply migration 0005 to the same D1 database.
3. Deploy the Worker.
4. Test a patient clinical record amendment and confirm the prior version remains in D1.

Do not run the demo seed against a production database containing real patient data.
