# OptiFlow Critical Build v11

## What changed
- Sidebar remains at the readable 14px navigation scale.
- Added delivery reliability migration `0004_delivery_reliability.sql`.
- Provider delivery now supports transient-failure retry scheduling with 5/15/30/60 minute backoff, up to four attempts.
- Provider HTTP 4xx errors (except retryable 408/425/429) fail immediately; 5xx/timeout-style failures are retried.
- Added `message_delivery_events` for idempotent webhook event recording.
- Message webhook now supports HMAC SHA-256 verification using `X-OptiFlow-Signature: sha256=<hex>` and retains the legacy secret header for controlled transition.
- Duplicate provider events are ignored safely.
- Delivery events update the latest message attempt and clear retry scheduling.
- Provider credentials remain server-side only.

## Required migration
Apply `0004_delivery_reliability.sql` after the previous migrations.

## Webhook contract
POST `/api/webhooks/messages`

Preferred header:
`X-OptiFlow-Signature: sha256=<HMAC-SHA256 hex of the raw request body using MESSAGE_WEBHOOK_SECRET>`

Body example:
`{"eventId":"provider-event-123","messageId":"MSG-...","status":"Delivered","providerMessageId":"provider-456"}`

Accepted statuses: `Sent`, `Delivered`, `Failed`, `Read`.

## Security
Do not place provider URLs, tokens, or webhook secrets in frontend code or GitHub. Configure them as Cloudflare Worker secrets/variables.
