# OptiFlow — Backend Connection Next Step

This package moves the existing OptiFlow interface toward the authenticated Worker + D1 architecture.

## What changed

- Fixed the Worker identity bug that would fail when an authorized Access user reached the API.
- Added a browser API client in `app.js`.
- Patient list now attempts to load from `/api/patients` after authentication.
- Patient detail refreshes from `/api/patients/:id`.
- New patients, tasks, recalls, messages and appointments use the API when the backend is connected.
- Recall send queues through the Worker instead of pretending an SMS/email was sent.
- Task completion writes through the API when connected.
- Added a secure-record connection indicator in the top bar.
- Hardened desktop sidebar navigation and mobile navigation.

## Required Cloudflare secret

The Worker uses Cloudflare Access for authentication. It then needs to map the authenticated Access email to a staff record.

In Cloudflare:

Workers & Pages → OptiFlow Worker → Settings → Variables and Secrets → Add

Create a **Secret** named:

`BOOTSTRAP_ADMIN_EMAIL`

Set its value to the exact email address you use to sign in through Cloudflare Access.

Do not put the email in GitHub source code.

The first authenticated API request from that exact email will create a Practice Manager staff record if one does not already exist.

Cloudflare documents Worker secrets as encrypted bindings and recommends secrets rather than plaintext variables for sensitive values.

## Deployment

1. Replace `app.js`, `styles.css`, `worker.js`, `wrangler.jsonc`, `wrangler.production.jsonc` and `.assetsignore` in GitHub.
2. Commit and allow Cloudflare to deploy.
3. Add the `BOOTSTRAP_ADMIN_EMAIL` Secret in the Cloudflare dashboard.
4. Deploy the secret change.
5. Open the OptiFlow URL and authenticate through Access.
6. Test `/api/health` in the same authenticated browser session.

Expected response shape:

```json
{
  "ok": true,
  "service": "optiflow-api",
  "user": "authorized-user@example.com",
  "role": "Practice Manager"
}
```

## Optional demo data

`optiflow_demo_seed.sql` contains fictional demo records only. **Do not run it against a live database containing real patient data.**

Use it only when you want the D1 database to reproduce the demonstration workspace while testing the application end-to-end.

The production workflow should create real patient records through the secured UI/API instead.

## Security boundary

The intended production path is:

Browser → Cloudflare Access → OptiFlow Worker → D1

The browser never connects directly to D1. Patient CRUD and other sensitive operations are authorized server-side.

## Important limitation

This stage does not yet provide real SMS/email delivery. Recall sending and messages are queued in the database. Provider credentials and delivery webhooks should be added in the next communications stage.


### D1 schema migration
The package now includes `0001_initial.sql` under the package root. Keep it with the deployment files. Your `wrangler*.jsonc` points to `migrations`; if your repository already has the same migration, do not create a duplicate migration. Apply the migration to the intended D1 database before testing the API if the schema has not already been created.


## Current authorization message

If the top bar says **“Your account is not authorized for OptiFlow”**, Cloudflare Access authentication has reached the Worker, but the authenticated email is not yet present in the `staff` table and does not match `BOOTSTRAP_ADMIN_EMAIL`.

Do not put the email in GitHub or in `wrangler.jsonc`. In Cloudflare Workers & Pages, open the Worker → Settings → Variables and Secrets → Add secret, create `BOOTSTRAP_ADMIN_EMAIL`, and enter the exact email address used to sign in through Cloudflare Access. Then redeploy/retry the Worker. The first successful authenticated request from that exact account creates the Practice Manager record.

Do not disable Cloudflare Access to work around this.

## Critical build wave included in this package

- Smaller, denser sidebar typography while retaining the classic visual hierarchy.
- Clinical record write APIs for medical history, allergies, medications, prescriptions and insurance.
- Recall, appointment and message status update APIs.
- Practice settings persistence through D1 with admin authorization.
- Staff administration endpoints with role validation and audit logging.
- Dashboard summary API foundation.
- Dashboard counts no longer invent message/recall totals when connected to the database.
- Quick messaging and practice settings now use the backend when connected.
- Clinical patient-record actions now open real data-entry workflows instead of placeholder editor toasts.

## Messaging / automation boundary

OptiFlow now stores outbound SMS/email messages as `Queued` records and stores recall send requests as queue events. A real SMS/email provider and delivery webhook are still required before the application can truthfully report that a message was delivered.

## Critical Build v6 — Messaging & Delivery Queue

v6 adds the server-side communication delivery foundation:

- `communication_preferences` stores explicit SMS/email opt-in or opt-out status.
- Manual outbound messages are rejected when the patient has explicitly opted out of that channel.
- `message_attempts` records provider attempts and errors without storing provider credentials in the browser.
- The scheduled Worker promotes eligible recalls, creates queued outbound messages for staff-queued recalls, and attempts provider delivery only when server-side provider secrets are configured.
- Delivery webhooks are accepted at `/api/webhooks/messages` using the `MESSAGE_WEBHOOK_SECRET` Worker secret and update message/attempt status.
- The application does not claim delivery when no provider is configured; messages remain queued and the UI identifies them as waiting for provider delivery.

### Provider environment variables

Configure these as Worker secrets/variables only after selecting a real provider and adapting its request contract:

- `SMS_PROVIDER_URL`
- `SMS_PROVIDER_TOKEN` (secret)
- `EMAIL_PROVIDER_URL`
- `EMAIL_PROVIDER_TOKEN` (secret)
- `MESSAGE_WEBHOOK_SECRET` (secret)

The generic provider adapter sends `{ to, body, channel, messageId }` with `Authorization: Bearer <token>`. The provider's webhook should POST to `/api/webhooks/messages` with the `X-OptiFlow-Webhook-Secret` header and a JSON body containing `messageId`, `status`, and optionally `providerMessageId`, `errorCode`, and `errorMessage`.

**Do not configure a provider until the provider-specific payload, authentication method, consent requirements, sender identity, rate limits, and webhook signing method have been verified.** The generic adapter is a controlled integration boundary, not a claim that a particular provider is already integrated.

### Migration

Apply `migrations/0003_messaging_delivery.sql` after the first two migrations.

Never run the demo seed against a live production database containing real patient data.


## Critical Build v7 — Administration, privacy and navigation refinement

v7 is the next stabilization wave and should be deployed after v6.

- Sidebar navigation typography is restored to a readable compact size (13px) instead of the overly small 11px treatment.
- Staff administration now supports secure role/active-status updates through `PATCH /api/staff/:id`, with self-deactivation blocked.
- Audit logs support bounded `limit` plus optional action/actor filtering for Practice Managers.
- Recall automation now checks explicit communication opt-out preferences before creating outbound SMS/email messages and records blocked attempts in the recall event trail.
- Reports no longer use a hard-coded "19 booked" value; booking counts are derived from the current appointment dataset.

### v7 security rule

Communication consent is enforced server-side. A browser/UI toggle is not considered sufficient authorization to contact a patient. Explicit opt-outs must block the corresponding outbound channel in the automation path.

### Deployment note

No new D1 migration is required for the v7 changes. They use the existing v1–v3 schema. Continue to apply the migrations in order on a new D1 database.
