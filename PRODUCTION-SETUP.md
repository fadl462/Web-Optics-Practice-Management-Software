# OptiFlow Production Backend Setup

This package adds the first secure server-side foundation to OptiFlow without replacing the working web interface blindly.

## Architecture

```text
Browser
  |
  | HTTPS + Cloudflare Access
  v
OptiFlow Worker
  |-- /api/*  -> authenticated API
  |-- static  -> existing web application
  |
  +--> Cloudflare D1
       |-- patients
       |-- prescriptions
       |-- insurance
       |-- recalls
       |-- messages
       |-- tasks
       |-- appointments
       |-- audit_events
       +-- staff / settings
```

Cloudflare Access should be used to restrict the application to approved staff. Cloudflare documents that Access authenticates the request before the Worker runs and exposes the authenticated identity through `ctx.access`. The Worker in this package therefore refuses API requests when Access has not authenticated the caller.

## 1. Create the production D1 database

From the project directory:

```bash
npx wrangler d1 create optiflow-production
```

Copy the returned `database_id` into `wrangler.production.jsonc`.

Do not create a production database with real patient data until the practice has confirmed its contractual, privacy, regulatory and data-residency requirements for the selected cloud services.

## 2. Apply the schema

The migration is in:

```text
migrations/0001_initial.sql
```

Apply it remotely:

```bash
npx wrangler d1 migrations apply optiflow-production --remote --config wrangler.production.jsonc
```

For local development:

```bash
npx wrangler d1 migrations apply optiflow-production --local --config wrangler.production.jsonc
```

Use separate preview/staging databases before production. Cloudflare's D1 migration system records applied migrations and supports local/remote application.

## 3. Configure the bootstrap administrator

Set the exact email address of the first Practice Manager:

```bash
npx wrangler secret put BOOTSTRAP_ADMIN_EMAIL --config wrangler.production.jsonc
```

The first authenticated request from that exact Access identity creates a Practice Manager record. Additional staff should be provisioned through the staff-management workflow rather than by allowing arbitrary users to self-register.

Do not place this value or any provider API keys in source code. Cloudflare recommends secrets for sensitive values rather than plaintext Wrangler variables.

## 4. Protect the Worker with Cloudflare Access

In Cloudflare Zero Trust, create an Access application for the OptiFlow hostname and allow only the practice's approved staff identities/groups.

Recommended policy direction:

- Practice Manager: full application access
- Providers: application access
- Front Desk: application access
- Viewer: application access only if required
- Everyone else: blocked

The application itself still performs role checks in the API. Access is authentication; OptiFlow's database-backed role model is authorization.

## 5. Deploy the Worker

The production config is intentionally separate from the current static deployment configuration:

```bash
npx wrangler deploy --config wrangler.production.jsonc
```

This Worker serves the existing static application and handles `/api/*` requests.

## 6. API endpoints added

### Authentication / health

- `GET /api/health`

### Patients

- `GET /api/patients?search=`
- `GET /api/patients/:id`
- `POST /api/patients`
- `PATCH /api/patients/:id`

### Tasks

- `GET /api/tasks`
- `POST /api/tasks`
- `PATCH /api/tasks/:id`

### Recalls

- `GET /api/recalls`
- `POST /api/recalls`
- `POST /api/recalls/:id/send`

The send endpoint queues an event; provider credentials never come from the browser.

### Messaging

- `GET /api/conversations`
- `POST /api/messages`

Outbound messages are queued. The next implementation step is a background delivery worker with provider webhooks and retry/dead-letter handling.

### Appointments

- `GET /api/appointments`
- `POST /api/appointments`

### Reports

- `GET /api/reports/practice-performance`

### Audit

- `GET /api/audit` — Practice Manager only

## 7. Security controls already in the Worker

- Cloudflare Access authentication requirement for API requests
- Database-backed staff authorization
- Server-side role permissions
- Same-origin enforcement for browser API calls
- JSON content-type enforcement
- Request body size limit
- Parameterized D1 queries
- Security response headers
- No patient API data cached by the browser response
- Audit events for important record operations
- Provider credentials never accepted from browser requests
- `noindex, nofollow` response header

## 8. Still required before live patient data

This is the most important boundary. The backend foundation is not by itself a completed clinical production system.

Before importing real patient information, implement and validate:

1. Complete staff provisioning and deactivation UI.
2. Full server-side CRUD for history, allergies, medications, insurance and prescriptions.
3. Secure SMS provider integration.
4. Transactional email provider integration.
5. Background recall scheduler using Workers Cron/Queues or an equivalent job system.
6. Provider delivery webhooks and retries.
7. Appointment conflict detection and calendar workflows.
8. Full audit coverage, including exports and sensitive record access.
9. Backup/restore testing and disaster recovery.
10. Data retention/deletion workflows.
11. Security testing and penetration testing.
12. Privacy/regulatory review for the actual deployment jurisdiction and vendors.
13. Frontend migration from `localStorage` to these API endpoints.
14. Staging environment with a separate database before production.

## 9. Frontend migration strategy

Do not remove the current demo persistence in one large change.

Use this sequence:

1. Add an API service layer.
2. Read authenticated patients from `/api/patients`.
3. Read/write patient records through `/api/patients/:id` and dedicated clinical endpoints.
4. Move recalls to `/api/recalls`.
5. Move messages to `/api/messages`.
6. Move tasks to `/api/tasks`.
7. Move appointments to `/api/appointments`.
8. Disable localStorage persistence once API health is confirmed.
9. Remove demo seed data from production builds.

This prevents the polished interface from being destabilized while the secure data layer is introduced.
