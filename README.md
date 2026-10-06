# OptiFlow Practice Management

A polished browser-based practice management interface for an optics/optometry practice. It is designed as a deployable front-end foundation and demonstrates the core workflows: patient records, prescriptions, insurance, recalls, SMS/email communication, tasks, search, and role-aware navigation.

## Run
Open `index.html` in a modern browser. No build step is required.

## Included
- Responsive desktop/mobile UI
- Dashboard with practice KPIs and activity
- Patient directory with search and detailed patient records
- Medical/clinical notes, insurance and prescription sections
- Automated recall queue + manual recall scheduling
- SMS/email-style patient messaging
- Staff task management with assignment/priority/status
- Modals for new patients, recalls, messages, appointments and tasks
- Local browser persistence using `localStorage`
- Clean HTML/CSS/JavaScript source

## Production architecture recommended
For a real clinical deployment, replace local storage with a secure backend/API and database. Recommended layers: PostgreSQL, REST/GraphQL API, server-side RBAC, audit logging, encrypted storage, managed secrets, SMS/email providers, background job queue, MFA/SSO, backups, monitoring, and formal privacy/security controls appropriate to the jurisdiction.

## Important
The current browser build uses demonstration records and simulated messaging. It is not suitable for real patient/PHI data until a secure production backend, authentication, authorization, encryption, audit controls, retention policy, consent controls, and compliant infrastructure are implemented and validated.
