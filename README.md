# OptiFlow Practice Management

OptiFlow is a responsive web application for optics/vision-practice operations. The current web layer provides a polished workspace for patient records, recalls, messaging, tasks, settings and management reporting.

## Current capabilities

- Responsive desktop and mobile workspace
- Hash-based navigation that survives refreshes
- Searchable patient directory
- Patient record workspace with:
  - demographics/contact details
  - medical & ocular history
  - allergies and medications
  - insurance and policy information
  - current and historical prescriptions
  - communications
  - recalls
  - appointments
  - operational timeline
- Dual-mode recall workflow:
  - automated queue concept
  - manual staff follow-up scheduling
  - SMS/email channel selection
  - priority and recommended-action logic
- Patient messaging workspace for SMS/email conversations
- Task management with assignment, priority, due dates, filters and workload intelligence
- Practice settings and role model
- Management reporting and CSV export
- Local demo-state persistence for UI development and demonstrations

## Important security boundary

This repository currently contains the **web/application layer and demo persistence**. It is **not yet a production PHI store**. The current demo state uses browser `localStorage`, which must not be used for real patient records.

Before production use with identifiable patient/clinical information, replace demo persistence with a secure server-side architecture and enforce authorization on the server/API. Recommended controls include:

- HTTPS/TLS everywhere
- Server-side authentication and role-based authorization
- MFA for privileged users
- Secure, server-side session management
- Encrypted database storage and encrypted backups
- Audit logging for patient-record access and changes
- Least-privilege permissions
- Input validation and output encoding
- CSRF protection where cookie-based sessions are used
- Rate limiting and abuse monitoring
- Secrets stored outside source code
- Backup, restore and disaster-recovery procedures
- Retention/deletion policies
- Production SMS/email provider with delivery webhooks
- Security testing before handling live patient data

UI role controls are a usability layer; they are **not a security boundary** until the API enforces the same permissions server-side.

## Recommended production architecture

```text
Browser
   |
   | HTTPS
   v
Web application
   |
   v
Authenticated API
   |
   +---- Patient / clinical database
   +---- Audit log store
   +---- File/object storage (if required)
   +---- SMS provider
   +---- Email provider
   +---- Background job / recall scheduler
```

For a Cloudflare deployment, a practical next stage is:

- Cloudflare Workers for the API
- Cloudflare D1 or another managed relational database for structured practice data
- Cloudflare Queues/Cron or an equivalent worker scheduler for recall jobs
- A transactional email provider
- An SMS provider
- Centralized audit events
- Secrets stored in Cloudflare secrets/environment bindings

The exact database/provider choice should be confirmed against the practice's regulatory, contractual and data-residency requirements before implementation.

## Core API contract to implement

### Patients

- `GET /api/patients?search=` — search patients
- `GET /api/patients/:id` — retrieve a patient record
- `POST /api/patients` — create a patient
- `PATCH /api/patients/:id` — update demographics/operational fields
- `GET /api/patients/:id/history`
- `POST /api/patients/:id/history`
- `GET /api/patients/:id/prescriptions`
- `POST /api/patients/:id/prescriptions`
- `GET /api/patients/:id/insurance`
- `PATCH /api/patients/:id/insurance`

### Recalls

- `GET /api/recalls`
- `POST /api/recalls`
- `PATCH /api/recalls/:id`
- `POST /api/recalls/:id/send`
- `POST /api/recalls/campaigns/run`

### Messaging

- `GET /api/conversations`
- `GET /api/conversations/:patientId`
- `POST /api/messages`
- `POST /api/messages/:id/retry`
- provider delivery webhooks for SMS/email status updates

### Tasks

- `GET /api/tasks`
- `POST /api/tasks`
- `PATCH /api/tasks/:id`
- `POST /api/tasks/:id/complete`

### Reporting

- `GET /api/reports/practice-performance`
- `GET /api/reports/recall-conversion`
- `GET /api/reports/patient-activity`
- `GET /api/reports/communication`
- `GET /api/reports/task-workload`

Every API endpoint that exposes patient information should require authentication and enforce authorization server-side.

## Suggested relational data model

- `users`
- `roles`
- `permissions`
- `user_roles`
- `patients`
- `patient_contacts`
- `patient_medical_history`
- `patient_allergies`
- `patient_medications`
- `insurance_policies`
- `prescriptions`
- `appointments`
- `recalls`
- `recall_events`
- `conversations`
- `messages`
- `message_delivery_events`
- `tasks`
- `audit_events`
- `practice_settings`

Use immutable IDs, created/updated timestamps, actor/user IDs and appropriate indexes. Do not expose internal database IDs unnecessarily to clients.

## Local development

The application is currently static and can be served with any static HTTP server.

Example:

```bash
python -m http.server 8080
```

Open the application in a modern browser.

### Resetting demo data

The application exposes `resetDemoData()` in the browser console to clear the demo state and reload the dashboard.

## Cloudflare deployment

The existing project uses Wrangler with static assets. Keep the current deployment configuration while using this web layer.

For production API/database work, introduce the API worker deliberately rather than replacing the working static deployment blindly. The frontend should then call `/api/...` endpoints instead of `localStorage`.

## Quality gate before production

1. Implement real authentication.
2. Implement server-side RBAC.
3. Move patient data out of `localStorage`.
4. Connect a production database.
5. Connect real SMS/email gateways.
6. Add background recall scheduling and retry handling.
7. Add audit logs.
8. Add automated backups and restore tests.
9. Add validation, rate limiting and security headers.
10. Test all patient-record workflows with representative non-production data.
11. Conduct security/privacy review before importing real patient data.
12. Perform an operational go-live test covering recall, messaging, appointments, tasks and reporting.
