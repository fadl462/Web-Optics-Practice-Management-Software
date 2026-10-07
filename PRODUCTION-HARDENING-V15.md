# OptiFlow Critical Build v15 — Production Hardening

## Added
- Server-side request rate limiting for API and message webhook traffic.
- Hashed client IPs in audit events; raw IP addresses are not stored in the audit table.
- Admin-only `/api/security/posture` endpoint for operational security visibility.
- Explicit security posture indicators for Access, RBAC, D1, audit logging, and provider configuration.
- Existing security headers, origin checks, body-size limits, RBAC, consent enforcement, delivery retries, and audit logging remain active.

## Important production boundaries
- Cloudflare Access remains the authentication boundary.
- D1 remains the system of record; browser localStorage is only a fallback workspace when the API is unavailable.
- Rate limiting is an additional safeguard, not a substitute for Cloudflare WAF/rate limiting at the edge.
- Backups/recovery should be configured at the Cloudflare account/database level and tested before production use. Do not treat a downloaded CSV export as a database backup.
- Real SMS/email provider credentials must be stored as Worker secrets, never in GitHub or frontend JavaScript.

## Deployment
1. Replace the current application files with this build.
2. Apply all D1 migrations through `0005_clinical_safety.sql`.
3. Configure `BOOTSTRAP_ADMIN_EMAIL` as a Worker secret.
4. If messaging is enabled, configure the provider URL/token secrets and `MESSAGE_WEBHOOK_SECRET`.
5. Deploy the Worker.
6. Sign in through Cloudflare Access and verify the Security & Administration area.
7. Verify `/api/security/posture` is only accessible to Practice Managers.

## Pre-production verification
- Create a test patient and verify persistence after refresh.
- Amend a clinical record and confirm the previous version remains in history.
- Create an appointment that overlaps another provider appointment and confirm the server rejects the conflict.
- Queue a recall and confirm consent rules are enforced.
- Trigger a simulated provider failure and verify retry scheduling.
- Send a verified webhook event and confirm delivery status reconciliation.
- Export a governed dataset and verify an audit event is created.
- Confirm Viewer and Front Desk accounts cannot export or access admin endpoints.
- Confirm audit events contain only hashed IP information.
