# LunchPoint — Architecture

## Architectural direction

LunchPoint is a single-page React application organized with a feature-based architecture. Domain behavior, screens, components, queries, forms, and permission checks live in the feature that owns them. Cross-cutting infrastructure is isolated from business features.

The client communicates only with Firebase Authentication and Cloud Firestore. Firestore Security Rules are the final authorization boundary; client-side role checks are used only to drive navigation and user experience.

## Application boundaries

| Boundary | Responsibility |
| --- | --- |
| Presentation | React pages, layouts, reusable UI, responsive Ukrainian interface. |
| Feature | Student, teacher, admin, reports, and settings use cases. |
| Application | Providers, query client, route guards, error handling, PWA registration. |
| Data access | Firebase initialization, typed repositories, Firestore converters, auth gateway. |
| Domain contracts | Types, Zod schemas, status rules, validation helpers. |
| Security | Google-only authentication, role-based Firestore Rules, append-only logs, no client-authorized deletion. |

## Identity and authorization

1. The user authenticates exclusively through Google Sign-In.
2. The app resolves `users/{uid}` after authentication.
3. If the document does not exist, the user is signed out or blocked from the application and sees: `Ваш акаунт ще не активовано адміністратором.`
4. The user document includes role (`student`, `teacher`, or `admin`), status, class relation when applicable, and audit metadata.
5. Routes and controls are role-aware. Firestore Rules independently enforce the same restrictions.

## Core domain model

| Collection | Purpose | Key fields / invariants |
| --- | --- | --- |
| `users` | Authorized identities and roles. | `uid`, `role`, `displayName`, `classId?`, `active`, timestamps. |
| `classes` | School classes and teacher ownership. | `name`, `teacherId`, `schoolYearId`, `active`. |
| `meals` | Daily meal attendance records. | `studentId`, `classId`, `dateKey`, `status`, actor metadata; unique by student and school date. |
| `logs` | Immutable audit trail. | action, entity reference, actor, before/after snapshots, timestamp; never deleted. |
| `reports` | Generated-report metadata and export history. | scope, filters, generatedBy, timestamps, optional storage reference. |
| `settings` | School-wide operational settings. | timezone, meal window, school profile, feature settings. |
| `schoolYears` | Academic calendar and date boundaries. | name, start/end dates, active. |

## Critical business invariants

- A student can create their own `meal` status only once per local school day; the UI exposes this as `🍽️ Я харчувався` and never offers undo.
- Meal status vocabulary is exactly `meal`, `noMeal`, `absent`, `pending`.
- A teacher may read and update records only for their assigned class and only between 10:00–14:00 in the configured school timezone.
- Administrators have unrestricted operational access, except deletion of audit logs, which is never allowed.
- Every business mutation writes an immutable log entry. Sensitive multi-document changes use Firestore transactions or batched writes so the state change and its audit entry succeed together.
- Reports are generated from authorized source data, with query scopes matching the role and filters.

## Firestore access strategy

- Use typed Firestore converters and repository interfaces in `src/services`.
- Use deterministic day keys (`YYYY-MM-DD` in the configured school timezone) and a deterministic record identifier or a transaction-protected uniqueness document to prevent duplicate student submissions.
- Query data through TanStack Query; mutations invalidate narrowly scoped keys.
- Store server-generated timestamps for authoritative audit sequencing.
- Security Rules reject unauthenticated access, disallow deletes, validate allowed fields/status transitions, enforce class ownership, and enforce the teacher time window.

## Planned route map

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | authenticated | Redirect to role dashboard. |
| `/sign-in` | public | Google Sign-In. |
| `/not-activated` | authenticated but absent from `users` | Activation notice. |
| `/student` | student | Daily status and personal history. |
| `/teacher` | teacher | Assigned-class attendance management. |
| `/admin` | admin | School administration dashboard. |
| `/admin/users` | admin | User activation and role/class assignment. |
| `/admin/classes` | admin | Class and teacher administration. |
| `/reports` | teacher, admin | Filters, previews, Excel/PDF exports. |
| `/settings` | admin | School and operational settings. |

## Quality attributes

- Desktop-first, responsive white UI with green accents and accessible semantic controls.
- PWA shell with offline-safe navigation, update handling, and explicitly designed behavior for unavailable data writes.
- Zod schemas at all form and persistence boundaries.
- React Hook Form for forms, TanStack Query for remote state, React Router for guarded routes.
- ExcelJS and pdfmake behind a reporting export service so UI is not coupled to output format.
- Error boundary, empty/loading states, telemetry-ready error normalization, and centralized permission messaging.
