# LunchPoint — Delivery Plan

## Phase 1 — Foundation

1. Initialize the React 19, TypeScript, Vite, Tailwind, Router, PWA, and testing/tooling baseline.
2. Configure Firebase project environments, local emulators, typed configuration, Hosting, and deployment workflows.
3. Establish the application shell, design tokens, providers, error boundaries, and route architecture.

## Phase 2 — Identity and security

1. Implement Google Sign-In and authorized-user resolution from `users`.
2. Build activation-pending experience and role-aware routing.
3. Define Firestore schema, composite indexes, converters, and comprehensive Firestore Security Rules.
4. Verify all data access with emulator rule tests, including denied-path scenarios.

## Phase 3 — Attendance domain

1. Implement student daily meal submission with idempotency and no-undo behavior.
2. Implement teacher class roster and controlled editing during 10:00–14:00.
3. Implement administrator management of users, classes, school years, and settings.
4. Add transactional immutable audit logging to every mutation.

## Phase 4 — Reporting

1. Build authorized daily, weekly, monthly, class, and student report queries.
2. Implement report filters, summaries, and export orchestration.
3. Produce XLSX exports through ExcelJS and PDFs through pdfmake.
4. Store report-generation metadata and audit events.

## Phase 5 — Production readiness

1. Add PWA installation/update behavior and offline UX.
2. Complete accessibility, responsive, performance, and localization checks.
3. Add unit, integration, and Firestore Rules tests; validate exports.
4. Set up CI checks, Firebase Hosting deployment, monitoring, backups/retention, and operational documentation.

## Approval gate

No application code, Firebase configuration, or deployment configuration should be written until this architecture is approved.
