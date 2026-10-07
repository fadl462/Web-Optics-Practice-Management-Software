# OptiFlow — Critical Build v10

## What changed

### Patient timeline
The patient record now loads a server-generated unified timeline from D1. It combines:
- Clinical history
- Allergies and safety information
- Medications
- Prescriptions
- Insurance updates
- Recalls and recall status
- Appointments
- Patient/practice messages
- Tasks

The timeline is read through the authenticated Worker and is limited to the patient's own record.

### Patient record UI
The timeline now shows an event category, compact event icon, detail, and timestamp. The frontend no longer fabricates recent patient activity when a backend record is available.

### Date handling
Dashboard and Reports now use the browser's current date rather than a hard-coded development date.

### Security
The existing Cloudflare Access + Worker + D1 authorization boundary remains in place. Patient timeline data is available only after server-side authorization.

## Deployment

1. Replace the current project files with the files in this package.
2. Keep the existing D1 migrations `0001_initial.sql`, `0002_patient_notes.sql`, and `0003_messaging_delivery.sql`.
3. Deploy the Worker using the existing `wrangler.production.jsonc`.
4. Keep `BOOTSTRAP_ADMIN_EMAIL` configured as a Worker secret.
5. If messaging providers are configured, keep their credentials as Worker secrets. Never place provider tokens in GitHub or frontend JavaScript.
6. Keep `MESSAGE_WEBHOOK_SECRET` configured before enabling delivery webhooks.

## Important

Do not run `optiflow_demo_seed.sql` against a production database containing real patient data.

Real SMS/email delivery is only active when the corresponding server-side provider URL and token are configured. Otherwise messages remain queued/provider-not-configured and are not represented as delivered.
