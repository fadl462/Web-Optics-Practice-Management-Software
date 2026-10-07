# OptiFlow Client Review Access

This package creates a separate, always-available client review environment.

## What it does

- Dedicated username/password login: `client-review`
- No client email is required.
- Creates a server-side `Client Reviewer` / `Viewer` staff identity after successful login.
- Uses a signed HttpOnly session cookie.
- Password is stored only as a Cloudflare Worker secret and verified with PBKDF2-SHA-256.
- Review users cannot create/edit/delete/export or administer records.
- Messaging webhooks and scheduled automation are disabled in the review Worker.
- The review Worker must use a separate D1 database.
- Production Worker and `optiflow-production-db` are not modified by this package.

## 1. Create the review D1 database

In Cloudflare:

Workers & Pages / D1 → Create database

Name:

`optiflow-client-review-db`

Copy the database ID.

Replace `REPLACE_WITH_CLIENT_REVIEW_D1_DATABASE_ID` in `wrangler.review.jsonc`.

## 2. Apply the existing OptiFlow schema

From the repository root:

```bash
npx wrangler d1 migrations apply optiflow-client-review-db --remote --config wrangler.review.jsonc
```

The existing `migrations/` folder is used. D1 migrations are versioned and applied to the selected database; verify the database name/ID before running the command.

## 3. Seed fictional review data

ONLY run this against the new review database:

```bash
npx wrangler d1 execute optiflow-client-review-db --remote --file=./optiflow_demo_seed.sql
```

Do not run this command against `optiflow-production-db`.

## 4. Configure review secrets

In the Client Review Worker's Variables and Secrets, create these as **Secrets**:

`REVIEW_USERNAME`
- Value: `client-review`

`REVIEW_PASSWORD`
- Value: choose a strong password that you will give privately to the client.

`REVIEW_SESSION_SECRET`
- Generate a long random value. Example:
  `EUIVKqyHbEe2Ql2M39yOQbHziiESUAjgil3e-18sVBg`

The Worker expects `REVIEW_PASSWORD` to contain a PBKDF2 password record, not the plaintext password.

### Generate the password record

Use the included helper:

```bash
node scripts/hash-review-password.mjs "YOUR-CHOSEN-PASSWORD"
```

Then paste the resulting single line into the `REVIEW_PASSWORD` secret.

Do NOT commit the password or the generated record to GitHub.

## 5. Deploy the review Worker

```bash
npx wrangler deploy --config wrangler.review.jsonc
```

The resulting Worker URL will be the client's review URL.

## 6. Client credentials

Give the client privately:

Username:
`client-review`

Password:
the password you selected.

The client can sign in at any time without you approving an email or session.

## Security boundary

Production remains protected by Cloudflare Access and continues using the existing production D1 database.

The Client Review Worker is intentionally separate and contains fictional data only. Do not connect it to production D1 and do not seed real patient information into it.

## Revoking access

To immediately disable the review account, remove/replace the `REVIEW_PASSWORD` secret or disable the review Worker.

The `/review-logout` endpoint clears the review session cookie.
