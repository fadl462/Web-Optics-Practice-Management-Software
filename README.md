# OptiFlow Practice Management

OptiFlow is a responsive optics/vision-practice management application. The current web layer provides the polished workspace for patient records, recalls, messaging, tasks, settings and reporting. This package also introduces a server-side Cloudflare Worker + D1 foundation for secure production workflows.

## Current web layer

- Responsive desktop and mobile workspace
- Hash-based navigation that survives refreshes
- Searchable patient directory
- Patient record workspace with demographics, history, allergies, medications, insurance, prescriptions, communications, recalls, appointments and timeline
- Dual-mode recall workflow
- Patient messaging workspace
- Task management with assignment, priority, due dates, filters and workload intelligence
- Practice settings and role model
- Management reporting and CSV export
- Local demo-state persistence for UI development

## Server-side foundation in this package

- `worker.js` — authenticated API + static asset worker
- `migrations/0001_initial.sql` — relational schema for staff, patients, clinical records, recalls, messaging, tasks, appointments and audit events
- `wrangler.production.jsonc` — production Worker/D1 configuration template
- `PRODUCTION-SETUP.md` — deployment and security setup guide

## Critical security boundary

The current browser demo uses `localStorage` and must not be used for real patient/clinical information. The production path is:

```text
Browser -> Cloudflare Access -> Worker API -> D1 / provider services
```

The API enforces authentication and role authorization server-side. UI-only role hiding is never treated as a security boundary.

Before live use, complete the controls and deployment checklist in `PRODUCTION-SETUP.md`, including the practice's privacy/regulatory/vendor review.
